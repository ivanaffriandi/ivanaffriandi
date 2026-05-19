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
    const res = await fetch(
      `${API_URL}/${BLOG_ID}/posts?key=${API_KEY}&fetchImages=true`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) throw new Error("Failed to fetch posts");
    
    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      published: item.published,
      url: item.url,
      labels: item.labels || [],
    }));
  } catch (error) {
    console.error("Error fetching Blogger posts:", error);
    return [];
  }
}

export async function getPost(id: string): Promise<BlogPost | null> {
  if (!BLOG_ID || !API_KEY) {
    // Mock return for local dev
    const posts = await getPosts();
    return posts.find((p) => p.id === id) || null;
  }

  try {
    const res = await fetch(`${API_URL}/${BLOG_ID}/posts/${id}?key=${API_KEY}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;

    const item = await res.json();
    return {
      id: item.id,
      title: item.title,
      content: item.content,
      published: item.published,
      url: item.url,
      labels: item.labels || [],
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function getPostComments(postId: string): Promise<BlogComment[]> {
  if (!BLOG_ID || !API_KEY) {
    return [];
  }

  try {
    const res = await fetch(`${API_URL}/${BLOG_ID}/posts/${postId}/comments?key=${API_KEY}`, {
      next: { revalidate: 0 }, // Fetch fresh comments in real time
    });
    if (!res.ok) return [];

    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      id: item.id,
      published: item.published,
      content: item.content,
      author: {
        displayName: item.author?.displayName || "Anonymous",
        image: item.author?.image,
      },
    }));
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}
