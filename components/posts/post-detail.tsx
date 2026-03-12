"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { PostStatus } from "@/types/post";

interface PostDetailProps {
  postId: string;
}

interface PostData {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  is_free: boolean;
  status: PostStatus;
  created_at: string;
  post_images?: {
    image_url: string;
    sort_order: number;
  }[];
}

interface AuthorProfile {
  display_name: string;
  campus: "kagurazaka" | "noda" | "katsushika" | null;
  contact_kakao_id: string | null;
}

const statusLabelMap: Record<PostStatus, string> = {
  available: "거래 가능",
  reserved: "예약 중",
  completed: "거래 완료",
};

export default function PostDetail({ postId }: PostDetailProps) {
  const [post, setPost] = useState<PostData | null>(null);
  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);



  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const campusLabelMap = {
  kagurazaka: "神楽坂",
  noda: "野田",
  katsushika: "葛飾",
} as const;

  const fetchPost = async () => {
    setLoading(true);
    setError(null);

    try {
      // 현재 로그인 유저
      const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  router.replace("/login");
  return;
}

setCurrentUserId(user.id);

      // 게시글 조회
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select(`
          id,
          user_id,
          title,
          description,
          price,
          is_free,
          status,
          created_at,
          post_images (
            image_url,
            sort_order
          )
        `)
        .eq("id", postId)
        .maybeSingle();

      if (postError || !postData) {
        setError("게시글을 불러오지 못했습니다.");
        return;
      }

      setPost(postData as PostData);

      // 작성자 프로필 조회
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("display_name, contact_kakao_id, campus")
        .eq("id", postData.user_id)
        .maybeSingle();

      if (!profileError && profileData) {
        setAuthor(profileData as AuthorProfile);
      } else {
        setAuthor(null);
      }
    } catch {
      setError("게시글을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
    setCurrentImageIndex(0);
  }, [postId]);

  const sortedImages = useMemo(() => {
    if (!post?.post_images) return [];
    return [...post.post_images].sort((a, b) => a.sort_order - b.sort_order);
  }, [post]);

  const isOwner = post && currentUserId === post.user_id;

  if (loading) {
    return <div className="text-sm text-gray-500">불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 게시글 본문 */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {new Date(post.created_at).toLocaleDateString("ko-KR")}
            </p>
          </div>

<span className="shrink-0 whitespace-nowrap rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
  {statusLabelMap[post.status]}
</span>
        </div>

        {sortedImages.length > 0 && (
  <div className="mb-6">
    <div className="relative overflow-hidden rounded-2xl bg-gray-100">
      <div className="flex h-80 items-center justify-center bg-gray-100 sm:h-96">
        <img
          src={sortedImages[currentImageIndex].image_url}
          alt={`${post.title} 이미지 ${currentImageIndex + 1}`}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {sortedImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={() =>
              setCurrentImageIndex((prev) =>
                prev === 0 ? sortedImages.length - 1 : prev - 1
              )
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-sm text-white"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() =>
              setCurrentImageIndex((prev) =>
                prev === sortedImages.length - 1 ? 0 : prev + 1
              )
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-sm text-white"
          >
            ›
          </button>
        </>
      )}
    </div>

    {sortedImages.length > 1 && (
      <div className="mt-3 flex items-center justify-center gap-2">
        {sortedImages.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentImageIndex(index)}
            className={`h-2.5 w-2.5 rounded-full ${
              index === currentImageIndex ? "bg-black" : "bg-gray-300"
            }`}
            aria-label={`이미지 ${index + 1} 보기`}
          />
        ))}
      </div>
    )}
  </div>
)}

        <div className="mb-4 text-lg font-semibold">
          {post.is_free ? "무료나눔" : `${post.price.toLocaleString()}엔`}
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="whitespace-pre-wrap text-sm leading-6">
            {post.description}
          </p>
        </div>
      </div>

      {/* 작성자 정보 */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">작성자 정보</h2>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">이름: </span>
            {author?.display_name ?? "알 수 없음"}
          </div>
        <div>
            <span className="font-medium">캠퍼스: </span>
            {author?.campus ? campusLabelMap[author.campus] : "미등록"}
        </div>

          <div>
            <span className="font-medium">카카오 ID: </span>
            {author?.contact_kakao_id ?? "미등록"}
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <Link
          href="/posts"
          className="rounded-xl border px-4 py-3 text-sm font-medium"
        >
          목록으로
        </Link>

        {isOwner && (
          <Link
            href={`/posts/${post.id}/edit`}
            className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white"
          >
            글 수정
          </Link>
        )}
      </div>
    </div>
  );
}