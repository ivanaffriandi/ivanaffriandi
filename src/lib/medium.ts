export interface BlogPost {
  id: string;
  title: string;
  content: string;
  published: string;
  url: string;
  labels?: string[];
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

// Persistent Global Cache to survive hot-reloads and rate-limiting
declare global {
  var _cachedMediumPosts: BlogPost[] | undefined;
  var _cachedMediumPostMap: Record<string, BlogPost> | undefined;
}

if (!global._cachedMediumPostMap) global._cachedMediumPostMap = {};

const RTDB_MEDIUM_POSTS_URL = "https://ivan-affriandi-default-rtdb.asia-southeast1.firebasedatabase.app/medium_posts.json";

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
    });
  }

  // Sort descending by date
  return items.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 12000): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Medium fetch timeout")), timeoutMs))
  ]);
}

export async function getPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetchWithTimeout(MEDIUM_FEED_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Medium RSS returned HTTP ${res.status}: ${res.statusText}`);

    const xmlText = await res.text();
    const posts = parseMediumRssXml(xmlText);

    if (posts.length > 0) {
      global._cachedMediumPosts = posts;
      posts.forEach((p) => {
        if (global._cachedMediumPostMap) global._cachedMediumPostMap[p.id] = p;
      });

      // Asynchronously back up posts to Firebase RTDB in background
      fetch(RTDB_MEDIUM_POSTS_URL, {
        method: "PUT",
        body: JSON.stringify(posts),
        headers: { "Content-Type": "application/json" }
      }).catch((err) => console.error("Medium RTDB backup failed:", err));

      return posts;
    }
  } catch (error) {
    console.warn("Medium RSS fetch failed (using cache/fallback):", (error as Error)?.message ?? error);
  }

  // Serve from memory cache if available
  if (global._cachedMediumPosts && global._cachedMediumPosts.length > 0) {
    console.log("Serving cached memory fallback list for Medium posts.");
    return global._cachedMediumPosts;
  }

  // Fallback to Firebase RTDB persistent backup
  try {
    console.log("Fetching persistent RTDB backup for Medium posts...");
    const backupRes = await fetchWithTimeout(RTDB_MEDIUM_POSTS_URL, { cache: "no-store" });
    if (backupRes.ok) {
      const backupPosts = await backupRes.json();
      if (backupPosts && Array.isArray(backupPosts) && backupPosts.length > 0) {
        console.log(`Successfully restored ${backupPosts.length} posts from Medium RTDB backup.`);
        global._cachedMediumPosts = backupPosts;
        backupPosts.forEach((p: any) => {
          if (global._cachedMediumPostMap) global._cachedMediumPostMap[p.id] = p;
        });
        return backupPosts;
      }
    }
  } catch (backupErr) {
    console.error("Failed to fetch Medium posts backup from RTDB:", backupErr);
  }

  return [];
}

export async function getPost(id: string): Promise<BlogPost | null> {
  if (global._cachedMediumPostMap && global._cachedMediumPostMap[id]) {
    return global._cachedMediumPostMap[id];
  }

  const posts = await getPosts();
  const found = posts.find((p) => p.id === id || p.url.includes(id));
  if (found) {
    if (global._cachedMediumPostMap) global._cachedMediumPostMap[id] = found;
    return found;
  }

  return null;
}

export async function getPostComments(_postId: string): Promise<BlogComment[]> {
  // Medium does not expose comments via RSS feed
  return [];
}
