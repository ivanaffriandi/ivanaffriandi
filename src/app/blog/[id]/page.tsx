import { getPost, getPostComments } from "@/lib/blogger";
import { notFound } from "next/navigation";
import BookReader from "@/components/BookReader";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.id);

  if (!post) {
    notFound();
  }

  const comments = await getPostComments(resolvedParams.id);

  return (
    <BookReader post={post} initialComments={comments} />
  );
}
