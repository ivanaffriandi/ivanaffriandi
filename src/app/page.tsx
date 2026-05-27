import { getPosts } from "@/lib/blogger";
import { getAllMoments } from "@/lib/moments";
import { getFallbackBooks } from "@/lib/books";
import DailyJournalFeed from "@/components/DailyJournalFeed";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch all Blogger posts, Firebase Moments, and local books database simultaneously for maximum performance
  const [posts, moments] = await Promise.all([
    getPosts(),
    getAllMoments()
  ]);

  const books = getFallbackBooks();

  // Render the interactive daily journal interface with server-side parsed books!
  return (
    <div style={{ minHeight: "auto", paddingBottom: "0rem", backgroundColor: "var(--bg-color)" }}>
      <DailyJournalFeed posts={posts} moments={moments} initialBooks={books} />
    </div>
  );
}

