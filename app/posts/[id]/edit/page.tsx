import PostEditForm from "@/components/posts/post-edit-form";

interface EditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPostPage({ params }: EditPageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <PostEditForm postId={id} />
    </main>
  );
}