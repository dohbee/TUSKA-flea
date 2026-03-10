import PostDetail from "@/components/posts/post-detail";

interface PostDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PostDetailPage({
  params,
}: PostDetailPageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <PostDetail postId={id} />
    </main>
  );
}