export interface BlogPost {
  id: string;
  title: string;
  content: string;
  published: string;
  updated?: string;
  url: string;
  labels?: string[];
  source?: "substack" | "medium" | "blogger";
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

const SUBSTACK_USERNAME = (process.env.SUBSTACK_USERNAME || "ivanaffriandi").replace(/^@/, "").trim();
const SUBSTACK_PUBLICATION = (process.env.SUBSTACK_PUBLICATION || "ivanaffriandi").replace(/^@/, "").trim();
const SUBSTACK_FEED_URL = process.env.SUBSTACK_FEED_URL?.trim();

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

    // 4. Published & Updated Date
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const atomUpdatedMatch = itemXml.match(/<atom:updated>([\s\S]*?)<\/atom:updated>/i) || itemXml.match(/<updated>([\s\S]*?)<\/updated>/i);
    const rawDate = pubDateMatch ? pubDateMatch[1].trim() : (atomUpdatedMatch ? atomUpdatedMatch[1].trim() : new Date().toISOString());
    const published = new Date(rawDate).toISOString();
    let updated: string | undefined = undefined;
    if (atomUpdatedMatch) {
      try {
        const u = new Date(atomUpdatedMatch[1].trim()).toISOString();
        if (u !== published) {
          updated = u;
        }
      } catch {}
    }

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
      updated,
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

function parseSubstackRssXml(xml: string): BlogPost[] {
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
    const rawGuid = guidMatch ? guidMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
    let id = "";
    if (url.includes("/p/")) {
      id = url.split("/p/")[1].split("?")[0].replace(/\/$/, "");
    } else if (rawGuid.includes("/p/")) {
      id = rawGuid.split("/p/")[1].split("?")[0].replace(/\/$/, "");
    } else if (rawGuid) {
      id = rawGuid.split("?")[0].split("/").pop() || rawGuid;
    } else {
      id = `substack-${items.length}`;
    }

    // 4. Published & Updated Date
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const atomUpdatedMatch = itemXml.match(/<atom:updated>([\s\S]*?)<\/atom:updated>/i) || itemXml.match(/<updated>([\s\S]*?)<\/updated>/i);
    const rawDate = pubDateMatch ? pubDateMatch[1].trim() : (atomUpdatedMatch ? atomUpdatedMatch[1].trim() : new Date().toISOString());
    let published = new Date().toISOString();
    try {
      published = new Date(rawDate).toISOString();
    } catch {}

    let updated: string | undefined = undefined;
    if (atomUpdatedMatch) {
      try {
        const u = new Date(atomUpdatedMatch[1].trim()).toISOString();
        if (u !== published) {
          updated = u;
        }
      } catch {}
    }

    // 5. Content Encoded
    const contentMatch = itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i) || itemXml.match(/<description>([\s\S]*?)<\/description>/i);
    let content = contentMatch ? parseCData(contentMatch[1]) : "";

    // Check enclosure image if not in content
    const enclosureMatch = itemXml.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*>/i);
    if (enclosureMatch && !content.includes(enclosureMatch[1])) {
      content = `<img src="${enclosureMatch[1]}" alt="${rawTitle}" /><br/>` + content;
    }

    // Clean Substack specific subscribe/paywall noise
    content = content
      .replace(/<div class="subscription-widget-wrap"[\s\S]*?<\/div>/gi, "")
      .replace(/<p class="button-wrapper"[\s\S]*?<\/p>/gi, "");

    // 6. Categories / Labels
    const categoryMatches = itemXml.match(/<category>([\s\S]*?)<\/category>/gi) || [];
    const labels = categoryMatches.map((catXml) => {
      const match = catXml.match(/<category>([\s\S]*?)<\/category>/i);
      return match ? parseCData(match[1]) : "";
    }).filter(Boolean);

    items.push({
      id: id || `substack-${items.length}`,
      title: rawTitle,
      content,
      published,
      updated,
      url,
      labels,
      source: "substack",
    });
  }

  return items;
}

async function fetchSubstackPosts(): Promise<BlogPost[]> {
  const candidateUrls: string[] = [];

  if (SUBSTACK_FEED_URL) {
    candidateUrls.push(SUBSTACK_FEED_URL);
  }

  // Standard publication feed endpoints
  const subdomains = Array.from(new Set([SUBSTACK_PUBLICATION, SUBSTACK_USERNAME, "ivanaffriandi", "ivanhuw"].filter(Boolean)));
  for (const sub of subdomains) {
    candidateUrls.push(`https://${sub}.substack.com/feed`);
  }

  // 1. Fetch Substack RSS feeds
  for (const url of candidateUrls) {
    try {
      const res = await fetchWithTimeout(`${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/rss+xml, application/xml, text/xml, */*",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
        cache: "no-store",
      }, 7000);

      if (res.ok) {
        const text = await res.text();
        if (text && text.includes("<rss") && text.includes("<item")) {
          const parsed = parseSubstackRssXml(text);
          if (parsed && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn(`Substack fetch attempt failed for ${url}:`, (err as Error)?.message ?? err);
    }
  }

  // 2. Also try Substack public archive / posts JSON API as fallback
  for (const sub of subdomains) {
    const apiUrls = [
      `https://${sub}.substack.com/api/v1/posts?sort=new&limit=50&_t=${Date.now()}`,
      `https://${sub}.substack.com/api/v1/archive?sort=new&limit=50&_t=${Date.now()}`
    ];
    for (const apiUrl of apiUrls) {
      try {
        const res = await fetchWithTimeout(apiUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
          cache: "no-store",
        }, 6000);

        if (res.ok) {
          const data = await res.json();
          const rawItems = Array.isArray(data) ? data : (data.posts || []);
          if (rawItems && rawItems.length > 0) {
            const mapped: BlogPost[] = rawItems.map((item: any) => {
              const coverImg = item.cover_image ? `<img src="${item.cover_image}" alt="${item.title || ''}" /><br/>` : "";
              const body = item.body_html || item.description || "";
              return {
                id: item.slug || String(item.id),
                title: item.title || "Untitled",
                content: coverImg + body,
                published: item.post_date ? new Date(item.post_date).toISOString() : new Date().toISOString(),
                url: item.canonical_url || `https://${sub}.substack.com/p/${item.slug || item.id}`,
                labels: (item.postTags || []).map((t: any) => t.name).filter(Boolean),
                source: "substack" as const,
              };
            });
            if (mapped.length > 0) {
              return mapped;
            }
          }
        }
      } catch {}
    }
  }

  return [];
}

async function fetchMediumPosts(): Promise<BlogPost[]> {
  const cleanUsername = MEDIUM_USERNAME.replace(/^@/, '');
  const feedUrls = [
    `${MEDIUM_FEED_URL}?_t=${Date.now()}`,
    `https://${cleanUsername}.medium.com/feed?_t=${Date.now()}`,
  ];

  for (const url of feedUrls) {
    try {
      const res = await fetchWithTimeout(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/rss+xml, application/xml, text/xml, */*",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
        cache: "no-store",
      }, 7000);

      if (res.ok) {
        const xmlText = await res.text();
        const parsed = parseMediumRssXml(xmlText);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`Medium fetch attempt failed for ${url}:`, (err as Error)?.message ?? err);
    }
  }

  return [];
}

const RTDB_BLOGGER_URL = "https://ivan-affriandi-default-rtdb.asia-southeast1.firebasedatabase.app/blogger_posts.json";

async function fetchBloggerPosts(): Promise<BlogPost[]> {
  if (BLOGGER_BLOG_ID && BLOGGER_API_KEY) {
    try {
      const res = await fetchWithTimeout(
        `${BLOGGER_API_URL}/${BLOGGER_BLOG_ID}/posts?key=${BLOGGER_API_KEY}&fetchImages=true`,
        { next: { revalidate: 60 } }
      );
      if (res.ok) {
        const data = await res.json();
        const items = (data.items || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          published: item.published,
          updated: item.updated && item.updated !== item.published ? item.updated : undefined,
          url: item.url,
          labels: item.labels || [],
          source: "blogger" as const,
        }));
        if (items.length > 0) return items;
      }
    } catch (err) {
      console.warn("Blogger fetch failed:", (err as Error)?.message ?? err);
    }
  }

  // Fallback to persistent Firebase RTDB blogger_posts backup
  try {
    const res = await fetchWithTimeout(RTDB_BLOGGER_URL, { cache: "no-store" }, 7000);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        const list = Array.isArray(data) ? data : Object.values(data);
        return list.map((item: any) => ({
          id: String(item.id),
          title: item.title,
          content: item.content || "",
          published: item.published || new Date().toISOString(),
          updated: item.updated && item.updated !== item.published ? item.updated : undefined,
          url: item.url || "#",
          labels: item.labels || [],
          source: "blogger" as const,
        }));
      }
    }
  } catch (err) {
    console.warn("RTDB blogger_posts fetch failed:", (err as Error)?.message ?? err);
  }

  return [];
}

export async function getPosts(): Promise<BlogPost[]> {
  // Fetch Substack (newest), Medium, and Blogger (historical archive) in parallel
  const [substackPosts, mediumPosts, bloggerPosts] = await Promise.all([
    fetchSubstackPosts(),
    fetchMediumPosts(),
    fetchBloggerPosts(),
  ]);

  if (substackPosts.length > 0 || mediumPosts.length > 0 || bloggerPosts.length > 0) {
    const seenTitles = new Set<string>();
    const merged: BlogPost[] = [];

    // Prioritize Substack posts (highest priority)
    for (const post of substackPosts) {
      const norm = post.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!seenTitles.has(norm)) {
        seenTitles.add(norm);
        merged.push(post);
      }
    }

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

    // Sort chronologically descending: newest posts first
    merged.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

    global._cachedHybridPosts = merged;
    const newMap: Record<string, BlogPost> = {};
    merged.forEach((p) => {
      newMap[p.id] = p;
    });
    global._cachedHybridPostMap = newMap;

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
        const newMap: Record<string, BlogPost> = {};
        backupPosts.forEach((p: any) => {
          newMap[p.id] = p;
        });
        global._cachedHybridPostMap = newMap;
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
