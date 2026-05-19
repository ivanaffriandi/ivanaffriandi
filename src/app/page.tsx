import { getPosts } from "@/lib/blogger";
import { getAllMoments } from "@/lib/moments";
import DailyJournalFeed from "@/components/DailyJournalFeed";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch all Blogger posts and Firebase Moments simultaneously for maximum performance
  const [posts, moments] = await Promise.all([
    getPosts(),
    getAllMoments()
  ]);

  // Render the interactive client-side daily journal interface!
  return (
    <div style={{ minHeight: "auto", paddingBottom: "0rem", backgroundColor: "var(--bg-color)" }}>
      <DailyJournalFeed posts={posts} moments={moments} />
    </div>
  );
}
