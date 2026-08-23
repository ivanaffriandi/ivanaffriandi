export interface BlogPost {
  id: string;
  title: string;
  content: string;
  published: string;
  url: string;
  labels?: string[];
  source?: "medium" | "blogger";
}

export interface BlogComment {
  id: string;
  published: string;
  content: string;
  author: {
    displayName: string;
    image?: { url: string };
  };
}

const MEDIUM_USERNAME = process.env.MEDIUM_USERNAME || "ivanaffriandi";
const MEDIUM_FEED_URL = `https://medium.com/feed/@${MEDIUM_USERNAME.replace(/^@/, '')}`;

const BLOGGER_BLOG_ID = process.env.BLOGGER_BLOG_ID;
const BLOGGER_API_KEY = process.env.BLOGGER_API_KEY;
const BLOGGER_API_URL = "https://www.googleapis.com/blogger/v3/blogs";

const RTDB_POSTS_URL = "https://ivan-affriandi-default-rtdb.asia-southeast1.firebasedatabase.app/hybrid_posts.json";

// Persistent Global Cache to survive hot-reloads and rate-limiting
declare global {
  var _cachedHybridPosts: BlogPost[] | undefined;
  var _cachedHybridPostMap: Record<string, BlogPost> | undefined;
  var _cachedCommentsMap: Record<string, BlogComment[]> | undefined;
}

if (!global._cachedHybridPostMap) global._cachedHybridPostMap = {};
if (!global._cachedCommentsMap) global._cachedCommentsMap = {};

function parseCData(str: string): string {
  if (!str) return "";
  const match = str.match(/<!\[CDATA\[([\s\S]*?)\]\]>/i);
  return match ? match[1].trim() : str.trim();
}

function parseMediumRssXml(xml: string): BlogPost[] {
  const items: BlogPost[] = [];
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const itemXml of itemMatches) {
    // 1. Title
    const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
    const rawTitle = titleMatch ? parseCData(titleMatch[1]) : "Untitled";

    // 2. Link
    const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
    const url = linkMatch ? linkMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "#";

    // 3. Guid / ID
    const guidMatch = itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
    let id = guidMatch ? guidMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
    if (id.includes("/p/")) {
      id = id.split("/p/").pop() || id;
    } else if (url.includes("-")) {
      id = url.split("?")[0].split("-").pop() || url;
    }

    // 4. Published Date
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || itemXml.match(/<atom:updated>([\s\S]*?)<\/atom:updated>/i);
    const rawDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
    const published = new Date(rawDate).toISOString();

    // 5. Content Encoded
    const contentMatch = itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i) || itemXml.match(/<description>([\s\S]*?)<\/description>/i);
    let content = contentMatch ? parseCData(contentMatch[1]) : "";
    
    // Clean Medium tracking pixel from content
    content = content.replace(/<img[^>]*medium\.com\/_\/stat[^>]*>/gi, "");

    // 6. Categories / Labels
    const categoryMatches = itemXml.match(/<category>([\s\S]*?)<\/category>/gi) || [];
    const labels = categoryMatches.map((catXml) => {
      const match = catXml.match(/<category>([\s\S]*?)<\/category>/i);
      return match ? parseCData(match[1]) : "";
    }).filter(Boolean);

    items.push({
      id: id || `medium-${items.length}`,
      title: rawTitle,
      content,
      published,
      url,
      labels,
      source: "medium",
    });
  }

  return items;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10000): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Fetch timeout")), timeoutMs))
  ]);
}

async function fetchMediumPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetchWithTimeout(MEDIUM_FEED_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Medium RSS HTTP ${res.status}`);
    const xmlText = await res.text();
    return parseMediumRssXml(xmlText);
  } catch (err) {
    console.warn("Medium fetch failed:", (err as Error)?.message ?? err);
    return [];
  }
}

async function fetchBloggerPosts(): Promise<BlogPost[]> {
  if (!BLOGGER_BLOG_ID || !BLOGGER_API_KEY) return [];

  try {
    const res = await fetchWithTimeout(
      `${BLOGGER_API_URL}/${BLOGGER_BLOG_ID}/posts?key=${BLOGGER_API_KEY}&fetchImages=true`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`Blogger API HTTP ${res.status}`);

    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      published: item.published,
      url: item.url,
      labels: item.labels || [],
      source: "blogger" as const,
    }));
  } catch (err) {
    console.warn("Blogger fetch failed:", (err as Error)?.message ?? err);
    return [];
  }
}

export async function getPosts(): Promise<BlogPost[]> {
  // Fetch both Medium (newest) and Blogger (historical archive) in parallel
  const [mediumPosts, bloggerPosts] = await Promise.all([
    fetchMediumPosts(),
    fetchBloggerPosts(),
  ]);

  if (mediumPosts.length > 0 || bloggerPosts.length > 0) {
    const seenTitles = new Set<string>();
    const merged: BlogPost[] = [];

    // Prioritize Medium posts
    for (const post of mediumPosts) {
      const norm = post.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!seenTitles.has(norm)) {
        seenTitles.add(norm);
        merged.push(post);
      }
    }

    // Add historical Blogger posts
    for (const post of bloggerPosts) {
      const norm = post.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!seenTitles.has(norm)) {
        seenTitles.add(norm);
        merged.push(post);
      }
    }

    // Sort chronologically descending: newest Medium posts first, seamlessly followed by Blogger archive
    merged.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

    global._cachedHybridPosts = merged;
    merged.forEach((p) => {
      if (global._cachedHybridPostMap) global._cachedHybridPostMap[p.id] = p;
    });

    // Background asynchronous backup to Firebase RTDB
    fetch(RTDB_POSTS_URL, {
      method: "PUT",
      body: JSON.stringify(merged),
      headers: { "Content-Type": "application/json" }
    }).catch(() => {});

    return merged;
  }

  // Serve from memory cache if available
  if (global._cachedHybridPosts && global._cachedHybridPosts.length > 0) {
    return global._cachedHybridPosts;
  }

  // Fallback to persistent Firebase RTDB backup
  try {
    const backupRes = await fetchWithTimeout(RTDB_POSTS_URL, { cache: "no-store" });
    if (backupRes.ok) {
      const backupPosts = await backupRes.json();
      if (backupPosts && Array.isArray(backupPosts) && backupPosts.length > 0) {
        global._cachedHybridPosts = backupPosts;
        backupPosts.forEach((p: any) => {
          if (global._cachedHybridPostMap) global._cachedHybridPostMap[p.id] = p;
        });
        return backupPosts;
      }
    }
  } catch {}

  return [];
}

export async function getPost(id: string): Promise<BlogPost | null> {
  if (global._cachedHybridPostMap && global._cachedHybridPostMap[id]) {
    return global._cachedHybridPostMap[id];
  }

  const posts = await getPosts();
  const found = posts.find((p) => p.id === id || p.url.includes(id));
  if (found) {
    if (global._cachedHybridPostMap) global._cachedHybridPostMap[id] = found;
    return found;
  }

  return null;
}

export async function getPostComments(postId: string): Promise<BlogComment[]> {
  if (!BLOGGER_BLOG_ID || !BLOGGER_API_KEY) return [];

  try {
    const res = await fetchWithTimeout(`${BLOGGER_API_URL}/${BLOGGER_BLOG_ID}/posts/${postId}/comments?key=${BLOGGER_API_KEY}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];

    const data = await res.json();
    const comments = (data.items || []).map((item: any) => ({
      id: item.id,
      published: item.published,
      content: item.content,
      author: {
        displayName: item.author?.displayName || "Anonymous",
        image: item.author?.image,
      },
    }));

    if (global._cachedCommentsMap) global._cachedCommentsMap[postId] = comments;
    return comments;
  } catch {
    if (global._cachedCommentsMap && global._cachedCommentsMap[postId]) {
      return global._cachedCommentsMap[postId];
    }
    return [];
  }
}
