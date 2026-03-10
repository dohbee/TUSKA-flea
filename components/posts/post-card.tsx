import Link from "next/link";
import type { PostStatus } from "@/types/post";

interface PostCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  is_free: boolean;
  status: PostStatus;
  created_at: string;
  authorName: string;
  imageUrl?: string | null;
}

const statusLabelMap: Record<PostStatus, string> = {
  available: "거래 가능",
  reserved: "예약 중",
  completed: "거래 완료",
};

export default function PostCard({
  id,
  title,
  description,
  price,
  is_free,
  status,
  created_at,
  authorName,
  imageUrl,
}: PostCardProps) {
  return (
    <Link
      href={`/posts/${id}`}
      className="block rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              이미지 없음
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h2 className="line-clamp-1 text-base font-semibold">{title}</h2>
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
              {statusLabelMap[status]}
            </span>
          </div>

          <p className="line-clamp-2 text-sm text-gray-600">{description}</p>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="font-semibold">
              {is_free ? "무료나눔" : `${price.toLocaleString()}엔`}
            </span>
            <span className="text-gray-500">{authorName}</span>
          </div>

          <p className="mt-1 text-xs text-gray-400">
            {new Date(created_at).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>
    </Link>
  );
}