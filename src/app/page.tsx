import { getPosts } from "@/lib/blogger";
import EditorialBlog from "@/components/EditorialBlog";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Ivan Affriandi",
  description: "Personal space and journal of Ivan Affriandi. Thoughts on software craft, typography, design systems, and life.",
};

export default async function HomePage() {
  const posts = await getPosts();

  return <EditorialBlog posts={posts} />;
}
