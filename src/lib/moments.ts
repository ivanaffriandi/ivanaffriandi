import { db, storage, hasFirebaseKeys } from "./firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { staticMoments } from "./localMoments";

export interface MomentItem {
  id: string;
  url: string;
  videoUrl?: string;
  title: string;
  story?: string;
  date: string;
  location: string;
  published: string;
  storagePath?: string;
  showOnHomepage?: boolean;
  homepageOrder?: number;
  permalink?: string;
  mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  likeCount?: number;
  children?: { url: string; videoUrl?: string; mediaType?: string }[];
}

// Fallback logic for LocalStorage Base64 URLs if Firebase API Keys are missing locally
const getLocalMoments = (): MomentItem[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("ivan_journal_moments");
  return stored ? JSON.parse(stored) : [];
};

const saveLocalMoments = (moments: MomentItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("ivan_journal_moments", JSON.stringify(moments));
};

export async function uploadMomentPhoto(file: File, path: string): Promise<{ url: string, storagePath: string }> {
  if (hasFirebaseKeys) {
    try {
      const storageRef = ref(storage, path);
      // Run storage upload & url fetching with a 3.5s race timeout
      const url = await Promise.race([
        (async () => {
          await uploadBytes(storageRef, file);
          return await getDownloadURL(storageRef);
        })(),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error("Firebase Storage timeout")), 3500))
      ]);
      return { url, storagePath: path };
    } catch (e) {
      console.warn("Firebase Storage failed or timed out, falling back to Local Base64:", e);
      // Fallback seamlessly to Base64 convert below
    }
  }
  
  // Fallback: convert file to Base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: reader.result as string, storagePath: "" });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function addMoment(momentData: Omit<MomentItem, "id" | "published">): Promise<MomentItem> {
  const newItem: Omit<MomentItem, "id"> = {
    ...momentData,
    published: new Date().toISOString()
  };

  if (hasFirebaseKeys) {
    try {
      // Run firestore addDoc with a 3.5s race timeout
      const docRef = await Promise.race([
        addDoc(collection(db, "moments"), newItem),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Firestore timeout")), 3500))
      ]);
      return { id: docRef.id, ...newItem };
    } catch (e) {
      console.warn("Firebase Firestore failed or timed out, falling back to LocalStorage:", e);
      // Fallback seamlessly to LocalStorage below
    }
  }

  const localMoments = getLocalMoments();
  const created: MomentItem = { id: `m-${Date.now()}`, ...newItem };
  localMoments.push(created);
  saveLocalMoments(localMoments);
  return created;
}

export async function getAllMoments(): Promise<MomentItem[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    console.warn("⚠️ [Instagram API] No INSTAGRAM_ACCESS_TOKEN found in environment variables.");
    return staticMoments;
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,children{media_url,thumbnail_url,media_type}&access_token=${token}`,
      { next: { revalidate: 60 } } // Cache for 60 seconds (1 minute)
    );

    if (!response.ok) {
      console.warn(`⚠️ [Instagram API] Failed to fetch Instagram media: ${response.statusText}`);
      return staticMoments;
    }

    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) {
      return staticMoments;
    }

    const moments: MomentItem[] = data.data.map((item: any, index: number) => {
      let dateString = "";
      let publishedString = "";
      try {
        if (item.timestamp) {
          const date = new Date(item.timestamp);
          dateString = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
          publishedString = date.toISOString();
        }
      } catch (e) {
        const fallbackDate = new Date();
        dateString = fallbackDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        publishedString = fallbackDate.toISOString();
      }

      let title = "";
      let story = "";
      if (item.caption) {
        const lines = item.caption.split("\n").map((l: string) => l.trim()).filter((l: string) => l.length > 0);
        if (lines.length > 0) {
          const firstLine = lines[0];
          title = firstLine.length > 50 ? firstLine.substring(0, 47) + "..." : firstLine;
          story = item.caption; // Keep full caption as story so they can read all of it
        }
      }

      const isVideo = item.media_type === "VIDEO";
      const imageUrl = isVideo ? (item.thumbnail_url || item.media_url) : item.media_url;

      // Parse carousel children for CAROUSEL_ALBUM
      let children: { url: string; videoUrl?: string; mediaType?: string }[] | undefined;
      if (item.media_type === "CAROUSEL_ALBUM" && item.children?.data) {
        children = item.children.data.map((child: any) => {
          const isChildVideo = child.media_type === "VIDEO";
          return {
            url: isChildVideo ? (child.thumbnail_url || child.media_url) : child.media_url,
            videoUrl: isChildVideo ? child.media_url : undefined,
            mediaType: child.media_type,
          };
        });
      }

      return {
        id: item.id || `IG-${index}`,
        url: imageUrl,
        videoUrl: isVideo ? item.media_url : undefined,
        title: title,
        story: story || undefined,
        date: dateString,
        location: "Instagram Feed",
        published: publishedString,
        permalink: item.permalink,
        mediaType: item.media_type,
        likeCount: typeof item.like_count === "number" ? item.like_count : undefined,
        children: children,
        showOnHomepage: index < 9,
        homepageOrder: index
      };
    });

    return moments.length > 0 ? moments : staticMoments;
  } catch (error) {
    console.error("❌ [Instagram API] Error fetching moments:", error);
    return staticMoments;
  }
}

export async function getInstagramStories(): Promise<MomentItem[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    console.warn("⚠️ [Instagram API] No INSTAGRAM_ACCESS_TOKEN found to fetch stories.");
    return [];
  }

  try {
    // Attempt to fetch live stories from Instagram Graph API (for Professional/Creator accounts)
    const response = await fetch(
      `https://graph.instagram.com/me/stories?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${token}`,
      { next: { revalidate: 30 } } // 30s revalidation for fresh live stories
    );

    if (!response.ok) {
      // Basic Display API doesn't support stories, this will fail gracefully.
      console.warn(`⚠️ [Instagram API] Stories endpoint returned status ${response.status}. Professional account may be required.`);
      return [];
    }

    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }

    return data.data.map((item: any, index: number) => {
      let dateString = "";
      let publishedString = "";
      try {
        if (item.timestamp) {
          const date = new Date(item.timestamp);
          dateString = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
          publishedString = date.toISOString();
        }
      } catch (e) {
        const fallbackDate = new Date();
        dateString = fallbackDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        publishedString = fallbackDate.toISOString();
      }

      const isVideo = item.media_type === "VIDEO";
      const imageUrl = isVideo ? (item.thumbnail_url || item.media_url) : item.media_url;

      return {
        id: item.id || `live-story-${index}`,
        url: imageUrl,
        videoUrl: isVideo ? item.media_url : undefined,
        title: item.caption || "Live Story",
        story: item.caption || "",
        date: dateString,
        location: "Instagram Story",
        published: publishedString,
        mediaType: item.media_type,
      };
    });
  } catch (error) {
    console.error("❌ [Instagram API] Error fetching live stories:", error);
    return [];
  }
}

export async function deleteMoment(id: string, storagePath?: string): Promise<boolean> {
  if (hasFirebaseKeys) {
    try {
      if (storagePath) {
        const storageRef = ref(storage, storagePath);
        await Promise.race([
          deleteObject(storageRef),
          new Promise<void>((_, reject) => setTimeout(() => reject(new Error("Storage delete timeout")), 3500))
        ]).catch(e => console.warn("Failed or timed out deleting storage file:", e?.message || e));
      }
      const docRef = doc(db, "moments", id);
      await Promise.race([
        deleteDoc(docRef),
        new Promise<void>((_, reject) => setTimeout(() => reject(new Error("Firestore delete timeout")), 3500))
      ]);
      return true;
    } catch (e: any) {
      console.error("Firebase delete error, using local fallback:", e?.message || e);
    }
  }

  const localMoments = getLocalMoments();
  const filtered = localMoments.filter(m => m.id !== id);
  saveLocalMoments(filtered);
  return true;
}

export async function updateMoment(id: string, data: Partial<MomentItem>): Promise<boolean> {
  if (hasFirebaseKeys) {
    try {
      const docRef = doc(db, "moments", id);
      await updateDoc(docRef, data);
      return true;
    } catch (e: any) {
      console.error("Firebase update error:", e?.message || e);
    }
  }

  const localMoments = getLocalMoments();
  const updated = localMoments.map(m => m.id === id ? { ...m, ...data } : m);
  saveLocalMoments(updated);
  return true;
}
