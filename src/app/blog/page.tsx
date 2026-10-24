import { getPosts } from "@/lib/blogger";
import EditorialBlog from "@/components/EditorialBlog";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Ethos & Journal — Ivan Affriandi",
  description: "A sustainable and modest ethos. Essays on software craft, typography, design systems, and life.",
};

export default async function BlogPage() {
  const posts = await getPosts();

  return <EditorialBlog posts={posts} />;
}
