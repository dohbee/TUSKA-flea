"use client";

import Link from "next/link";
import { useState } from "react";
import type { PostStatus } from "@/types/post";

interface MyPostCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  is_free: boolean;
  status: PostStatus;
  created_at: string;
  onChangeStatus: (postId: string, nextStatus: PostStatus) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
}

const statusLabelMap: Record<PostStatus, string> = {
  available: "거래 가능",
  reserved: "예약 중",
  completed: "거래 완료",
};

const statusOptions: PostStatus[] = ["available", "reserved", "completed"];

export default function MyPostCard({
  id,
  title,
  description,
  price,
  is_free,
  status,
  created_at,
  onChangeStatus,
  onDelete,
}: MyPostCardProps) {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleStatusChange = async (nextStatus: PostStatus) => {
    if (nextStatus === status) return;

    setUpdating(true);
    try {
      await onChangeStatus(id, nextStatus);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("이 게시글을 삭제하시겠습니까?");
    if (!confirmed) return;

    setDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1 text-xs text-gray-400">
            {new Date(created_at).toLocaleDateString("ko-KR")}
          </p>
        </div>

        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
          {statusLabelMap[status]}
        </span>
      </div>

      <p className="mb-3 whitespace-pre-wrap text-sm text-gray-600">
        {description}
      </p>

      <p className="mb-4 text-sm font-semibold">
        {is_free ? "무료나눔" : `${price.toLocaleString()}엔`}
      </p>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => {
            const isActive = option === status;

            return (
              <button
                key={option}
                type="button"
                disabled={updating || deleting}
                onClick={() => handleStatusChange(option)}
                className={`whitespace-nowrap rounded-lg border px-3 py-2 text-sm ${
                  isActive
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white text-gray-700"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {statusLabelMap[option]}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/posts/${id}/edit`}
            className="flex-1 whitespace-nowrap rounded-lg border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            글 수정
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || updating}
            className="flex-1 whitespace-nowrap rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}