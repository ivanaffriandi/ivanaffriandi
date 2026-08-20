import { getPosts } from "@/lib/blogger";
import DailyJournalFeed from "@/components/DailyJournalFeed";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Ivan's Journal",
  description: "Quiet thoughts, essays on software craft, typography, sartorial tailoring, and life.",
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main style={{ minHeight: "100%", width: "100%" }}>
      <DailyJournalFeed posts={posts} />
    </main>
  );
}
