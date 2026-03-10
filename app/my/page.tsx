"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import MyPostCard from "@/components/posts/my-post-card";
import type { PostStatus } from "@/types/post";

interface MyPostItem {
  id: string;
  title: string;
  description: string;
  price: number;
  is_free: boolean;
  status: PostStatus;
  created_at: string;
}

function extractStoragePathFromPublicUrl(url: string) {
  const marker = "/storage/v1/object/public/post-images/";
  const index = url.indexOf(marker);

  if (index === -1) return null;

  return url.slice(index + marker.length);
}

export default function MyPage() {
  const [posts, setPosts] = useState<MyPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyPosts = async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("로그인 정보를 확인할 수 없습니다.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .select("id, title, description, price, is_free, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setError("내 게시글을 불러오는 중 오류가 발생했습니다.");
      setLoading(false);
      return;
    }

    setPosts((data as MyPostItem[]) ?? []);
    setLoading(false);
  };

  const handleChangeStatus = async (
    postId: string,
    nextStatus: PostStatus
  ) => {
    const { error } = await supabase
      .from("posts")
      .update({ status: nextStatus })
      .eq("id", postId);

    if (error) {
      setError("게시글 상태 변경 중 오류가 발생했습니다.");
      return;
    }

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, status: nextStatus } : post
      )
    );
  };

  const handleDelete = async (postId: string) => {
    setError(null);

    try {
      // 1) 연결된 이미지 조회
      const { data: imageRows, error: imageFetchError } = await supabase
        .from("post_images")
        .select("image_url")
        .eq("post_id", postId);

      if (imageFetchError) {
        throw new Error("게시글 이미지 정보를 불러오는 중 오류가 발생했습니다.");
      }

      // 2) storage 파일 삭제
      const filePaths =
        imageRows
          ?.map((row) => extractStoragePathFromPublicUrl(row.image_url))
          .filter((path): path is string => Boolean(path)) ?? [];

      if (filePaths.length > 0) {
        const { error: storageDeleteError } = await supabase.storage
          .from("post-images")
          .remove(filePaths);

        if (storageDeleteError) {
          throw new Error(`이미지 파일 삭제 실패: ${storageDeleteError.message}`);
        }
      }

      // 3) posts 삭제
      // post_images는 FK cascade로 같이 삭제될 가능성이 높지만,
      // 핵심은 storage 파일 정리 후 posts를 지우는 것
      const { error: postDeleteError } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (postDeleteError) {
        throw new Error(`게시글 삭제 실패: ${postDeleteError.message}`);
      }

      // 4) 화면에서 제거
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("게시글 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">내 글 관리</h1>
        <p className="mt-2 text-sm text-gray-600">
          내가 작성한 게시글을 확인하고 거래 상태를 변경할 수 있습니다.
        </p>
      </div>

      {loading && <p className="text-sm text-gray-500">불러오는 중...</p>}

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="rounded-2xl border bg-white px-6 py-10 text-center text-sm text-gray-500">
          아직 작성한 게시글이 없습니다.
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="grid gap-4">
          {posts.map((post) => (
            <MyPostCard
              key={post.id}
              id={post.id}
              title={post.title}
              description={post.description}
              price={post.price}
              is_free={post.is_free}
              status={post.status}
              created_at={post.created_at}
              onChangeStatus={handleChangeStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </main>
  );
}