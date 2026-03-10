"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import PostCard from "@/components/posts/post-card";
import type { PostStatus } from "@/types/post";

interface PostListItem {
  id: string;
  title: string;
  description: string;
  price: number;
  is_free: boolean;
  status: PostStatus;
  created_at: string;
  user_id: string;
  post_images: {
    image_url: string;
    sort_order: number;
  }[];
}

interface AuthorMap {
  [userId: string]: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [authorMap, setAuthorMap] = useState<AuthorMap>({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select(`
          id,
          title,
          description,
          price,
          is_free,
          status,
          created_at,
          user_id,
          post_images (
            image_url,
            sort_order
          )
        `)
        .order("created_at", { ascending: false });

      if (postError) {
        console.error("postError:", postError);
        setError("게시글을 불러오는 중 오류가 발생했습니다.");
        return;
      }

      const normalizedPosts = (postData ?? []) as PostListItem[];
      setPosts(normalizedPosts);

      const userIds = [...new Set(normalizedPosts.map((post) => post.user_id))];

      if (userIds.length === 0) {
        setAuthorMap({});
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);

      if (profileError) {
        console.error("profileError:", profileError);
        setAuthorMap({});
        return;
      }

      const nextAuthorMap: AuthorMap = {};
      for (const profile of profileData ?? []) {
        nextAuthorMap[profile.id] = profile.display_name;
      }

      setAuthorMap(nextAuthorMap);
    } catch (err) {
      console.error(err);
      setError("게시글을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    if (!keyword) return posts;

    return posts.filter((post) =>
      post.title.toLowerCase().includes(keyword)
    );
  }, [posts, searchKeyword]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">게시글</h1>
        <p className="mt-2 text-sm text-gray-600">
          학교 한국인 유학생 대상 나눔/중고 게시판입니다.
        </p>
      </div>

      <div className="mb-6">
        <label htmlFor="post-search" className="mb-2 block text-sm font-medium">
          제목 검색
        </label>
        <input
          id="post-search"
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="예: 계산기, 교재, 공학용"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
        />
      </div>

      {loading && <p className="text-sm text-gray-500">불러오는 중...</p>}

      {error && (
        <div className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="rounded-2xl border bg-white px-6 py-10 text-center text-sm text-gray-500">
          아직 등록된 게시글이 없습니다.
        </div>
      )}

      {!loading && !error && posts.length > 0 && filteredPosts.length === 0 && (
        <div className="rounded-2xl border bg-white px-6 py-10 text-center text-sm text-gray-500">
          검색 결과가 없습니다.
        </div>
      )}

      {!loading && !error && filteredPosts.length > 0 && (
        <div className="grid gap-4">
          {filteredPosts.map((post) => {
            const sortedImages = [...(post.post_images ?? [])].sort(
              (a, b) => a.sort_order - b.sort_order
            );

            return (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                description={post.description}
                price={post.price}
                is_free={post.is_free}
                status={post.status}
                created_at={post.created_at}
                authorName={authorMap[post.user_id] ?? "알 수 없음"}
                imageUrl={sortedImages[0]?.image_url ?? null}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}