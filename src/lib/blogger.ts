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

const BLOG_ID = process.env.BLOGGER_BLOG_ID;
const API_KEY = process.env.BLOGGER_API_KEY;
const API_URL = `https://www.googleapis.com/blogger/v3/blogs`;

// Persistent Global Cache to survive hot-reloads and rate-limiting!
declare global {
  var _cachedPosts: BlogPost[] | undefined;
  var _cachedPostMap: Record<string, BlogPost> | undefined;
  var _cachedCommentsMap: Record<string, BlogComment[]> | undefined;
}

if (!global._cachedPostMap) global._cachedPostMap = {};
if (!global._cachedCommentsMap) global._cachedCommentsMap = {};

const RTDB_POSTS_URL = "https://ivan-affriandi-default-rtdb.asia-southeast1.firebasedatabase.app/blogger_posts.json";

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10000): Promise<Response> {
  // Safe Promise.race timeout: we race the fetch query against a timeout reject.
  // We do NOT use AbortController signal here, as aborting server-side fetches inside Next.js 
  // Server Components can disrupt Next.js's internal streaming payload, causing client-side Turbopack crashes.
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Blogger fetch timeout")), timeoutMs))
  ]);
}

export async function getPosts(): Promise<BlogPost[]> {
  if (!BLOG_ID || !API_KEY) {
    console.warn("Blogger API credentials are not set. Returning mock data.");
    return [
      {
        id: "1",
        title: "The Essence of Swiss Design",
        content: "<p>Swiss design is characterized by its emphasis on cleanliness, readability, and objectivity. Hallmarks include asymmetric layouts, use of a grid, sans-serif typefaces like Akzidenz-Grotesk, and flush left, ragged right text.</p>",
        published: new Date().toISOString(),
        url: "#",
        labels: ["Design", "Typography"],
      },
      {
        id: "2",
        title: "Why Minimalism Matters",
        content: "<p>In an increasingly noisy world, minimalism in digital interfaces provides a breath of fresh air. By removing the non-essential, we allow the content to speak for itself.</p>",
        published: new Date(Date.now() - 86400000).toISOString(),
        url: "#",
        labels: ["Thoughts"],
      },
    ];
  }

  try {
    const res = await fetchWithTimeout(
      `${API_URL}/${BLOG_ID}/posts?key=${API_KEY}&fetchImages=true`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) throw new Error(`Blogger API returned error: ${res.statusText}`);
    
    const data = await res.json();
    const posts = (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      published: item.published,
      url: item.url,
      labels: item.labels || [],
    }));

    // Update global persistent cache
    global._cachedPosts = posts;
    posts.forEach((p: any) => {
      if (global._cachedPostMap) global._cachedPostMap[p.id] = p;
    });

    // Asynchronously back up posts to Firebase RTDB in background
    fetch(RTDB_POSTS_URL, {
      method: "PUT",
      body: JSON.stringify(posts),
      headers: { "Content-Type": "application/json" }
    }).catch((err) => console.error("Blogger RTDB backup failed:", err));

    return posts;
  } catch (error) {
    console.warn("Blogger posts fetch failed (using cache/fallback):", (error as Error)?.message ?? error);
    
    // Serve from global memory cache if present
    if (global._cachedPosts && global._cachedPosts.length > 0) {
      console.log("Serving cached memory fallback list for Blogger posts.");
      return global._cachedPosts;
    }

    // Fallback to Firebase RTDB persistent backup
    try {
      console.log("Fetching persistent RTDB backup for Blogger posts...");
      const backupRes = await fetchWithTimeout(RTDB_POSTS_URL, { cache: "no-store" });
      if (backupRes.ok) {
        const backupPosts = await backupRes.json();
        if (backupPosts && Array.isArray(backupPosts) && backupPosts.length > 0) {
          console.log(`Successfully restored ${backupPosts.length} posts from RTDB backup.`);
          global._cachedPosts = backupPosts;
          backupPosts.forEach((p: any) => {
            if (global._cachedPostMap) global._cachedPostMap[p.id] = p;
          });
          return backupPosts;
        }
      }
    } catch (backupErr) {
      console.error("Failed to fetch Blogger posts backup from RTDB:", backupErr);
    }

    return [];
  }
}

export async function getPost(id: string): Promise<BlogPost | null> {
  if (!BLOG_ID || !API_KEY) {
    const posts = await getPosts();
    return posts.find((p) => p.id === id) || null;
  }

  try {
    const res = await fetchWithTimeout(`${API_URL}/${BLOG_ID}/posts/${id}?key=${API_KEY}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Blogger API returned error: ${res.statusText}`);

    const item = await res.json();
    const post = {
      id: item.id,
      title: item.title,
      content: item.content,
      published: item.published,
      url: item.url,
      labels: item.labels || [],
    };

    // Cache single post
    if (global._cachedPostMap) global._cachedPostMap[id] = post;

    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    
    // Serve cached fallback for post if available
    if (global._cachedPostMap && global._cachedPostMap[id]) {
      console.log(`Serving cached fallback for post ID: ${id}`);
      return global._cachedPostMap[id];
    }
    
    // Fall back to getPosts cached array
    if (global._cachedPosts) {
      const found = global._cachedPosts.find((p) => p.id === id);
      if (found) return found;
    }

    // Try fetching posts list from Firebase RTDB to find the post
    try {
      const backupRes = await fetchWithTimeout(RTDB_POSTS_URL, { cache: "no-store" });
      if (backupRes.ok) {
        const backupPosts = await backupRes.json();
        if (backupPosts && Array.isArray(backupPosts)) {
          const found = backupPosts.find((p) => p.id === id);
          if (found) {
            if (global._cachedPostMap) global._cachedPostMap[id] = found;
            return found;
          }
        }
      }
    } catch {}

    return null;
  }
}

export async function getPostComments(postId: string): Promise<BlogComment[]> {
  if (!BLOG_ID || !API_KEY) {
    return [];
  }

  try {
    const res = await fetchWithTimeout(`${API_URL}/${BLOG_ID}/posts/${postId}/comments?key=${API_KEY}`, {
      next: { revalidate: 30 }, // 30 seconds caching for comments
    });
    if (!res.ok) throw new Error(`Blogger API returned error: ${res.statusText}`);

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
  } catch (error) {
    console.error("Error fetching comments:", error);
    // Serve cached comments fallback on error
    if (global._cachedCommentsMap && global._cachedCommentsMap[postId]) {
      console.log(`Serving cached fallback comments for post ID: ${postId}`);
      return global._cachedCommentsMap[postId];
    }
    return [];
  }
}
