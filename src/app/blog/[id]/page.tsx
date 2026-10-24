import { getPost, getPosts, getPostComments } from "@/lib/blogger";
import { notFound } from "next/navigation";
import EditorialBlog from "@/components/EditorialBlog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.id);
  if (!post) return { title: "Post Not Found — Ivan Affriandi" };
  const cleanExcerpt = post.content ? post.content.replace(/<[^>]+>/g, " ").slice(0, 160) : "";
  return {
    title: `${post.title} — Ivan Affriandi`,
    description: cleanExcerpt || undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const [post, allPosts, comments] = await Promise.all([
    getPost(resolvedParams.id),
    getPosts(),
    getPostComments(resolvedParams.id),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <EditorialBlog
      posts={allPosts}
      initialPost={post}
      initialComments={comments}
    />
  );
}
