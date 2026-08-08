import { getPosts } from "@/lib/blogger";
import DailyJournalFeed from "@/components/DailyJournalFeed";

export default async function Home() {
  const posts = await getPosts();

  return (
    <div style={{ minHeight: "auto", backgroundColor: "var(--bg-color)" }}>
      <DailyJournalFeed posts={posts} />
    </div>
  );
}
