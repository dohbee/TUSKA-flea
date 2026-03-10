"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_COUNT,
  MAX_ORIGINAL_IMAGE_SIZE_MB,
  compressImage,
} from "@/lib/image";

export default function PostCreateForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validateForm() {
    if (!title.trim()) {
      return "제목을 입력해주세요.";
    }

    if (title.trim().length < 2) {
      return "제목은 2자 이상 입력해주세요.";
    }

    if (!description.trim()) {
      return "상세설명을 입력해주세요.";
    }

    if (!isFree) {
      if (!price.trim()) {
        return "가격을 입력해주세요.";
      }

      const numericPrice = Number(price);

      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        return "가격은 0 이상의 숫자로 입력해주세요.";
      }
    }

    if (images.length > MAX_IMAGE_COUNT) {
      return `이미지는 최대 ${MAX_IMAGE_COUNT}장까지 업로드할 수 있습니다.`;
    }

    return null;
  }

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(e.target.files ?? []);

    if (selectedFiles.length === 0) {
      setImages([]);
      return;
    }

    if (selectedFiles.length > MAX_IMAGE_COUNT) {
      setError(`이미지는 최대 ${MAX_IMAGE_COUNT}장까지 업로드할 수 있습니다.`);
      return;
    }

    for (const file of selectedFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError("jpg, jpeg, png, webp 파일만 업로드할 수 있습니다.");
        return;
      }

      const fileSizeMb = file.size / (1024 * 1024);
      if (fileSizeMb > MAX_ORIGINAL_IMAGE_SIZE_MB) {
        setError(
          `이미지 1장당 최대 ${MAX_ORIGINAL_IMAGE_SIZE_MB}MB까지 가능합니다.`
        );
        return;
      }
    }

    setError(null);
    setImages(selectedFiles);

    const previewUrls = selectedFiles.map((file) =>
      URL.createObjectURL(file)
);

    setImagePreviews(previewUrls);
  };

  const uploadImages = async (postId: string, userId: string) => {
    if (images.length === 0) return;

    const uploadedRows: {
      post_id: string;
      image_url: string;
      sort_order: number;
    }[] = [];

    for (let i = 0; i < images.length; i += 1) {
      const originalFile = images[i];
      const compressedFile = await compressImage(originalFile);

      const filePath = `${userId}/${postId}/${crypto.randomUUID()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, compressedFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/jpeg",
        });

      if (uploadError) {
        console.error("uploadError:", uploadError);
        throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      uploadedRows.push({
        post_id: postId,
        image_url: publicUrlData.publicUrl,
        sort_order: i,
      });
    }

    const { error: imageInsertError } = await supabase
      .from("post_images")
      .insert(uploadedRows);

    if (imageInsertError) {
      console.error("imageInsertError:", imageInsertError);
      throw new Error(`이미지 정보 저장 실패: ${imageInsertError.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("로그인 정보를 확인할 수 없습니다.");
        return;
      }

      const finalPrice = isFree ? 0 : Number(price);

      const { data: insertedPost, error: insertError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          price: finalPrice,
          is_free: isFree,
          status: "available",
        })
        .select("id")
        .single();

      if (insertError || !insertedPost) {
        console.error("insertError:", insertError);
        setError(
          insertError?.message ?? "게시글 등록 중 오류가 발생했습니다."
        );
        return;
      }

      await uploadImages(insertedPost.id, user.id);

      router.push("/posts");
      router.refresh();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("게시글 등록 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">글쓰기</h1>
        <p className="mt-2 text-sm text-gray-600">
          책이나 물품 정보를 입력하고 게시글을 등록해주세요.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 카시오 공학용 계산기 판매합니다"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium"
          >
            상세설명
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="사용감, 상태, 거래 희망 장소 등을 적어주세요."
            rows={6}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isFree"
            type="checkbox"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="isFree" className="text-sm font-medium">
            무료나눔
          </label>
        </div>

        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium">
            가격(엔)
          </label>
          <input
            id="price"
            type="number"
            min="0"
            value={isFree ? "0" : price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isFree}
            placeholder="예: 500"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-black disabled:bg-gray-100"
          />
        </div>

 <div>
  <label className="mb-1 block text-sm font-medium">이미지 업로드</label>

  <input
    id="images"
    type="file"
    accept="image/jpeg,image/jpg,image/png,image/webp"
    multiple
    onChange={handleImageChange}
    className="hidden"
  />

  <div className="flex items-center gap-3">
    <label
      htmlFor="images"
      className="inline-flex cursor-pointer items-center rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-100"
    >
      파일 선택
    </label>

    <span className="text-sm text-gray-500">
      {images.length > 0
        ? `${images.length}개 선택됨`
        : "선택된 파일 없음"}
    </span>
  </div>
{imagePreviews.length > 0 && (
  <div className="mt-4 grid grid-cols-3 gap-3">
    {imagePreviews.map((src, index) => (
      <div
        key={src}
        className="relative overflow-hidden rounded-lg border bg-gray-100"
      >
        <img
          src={src}
          alt="preview"
          className="h-24 w-full object-cover"
        />

        <button
          type="button"
          onClick={() => {
            setImages((prev) => prev.filter((_, i) => i !== index));
            setImagePreviews((prev) =>
              prev.filter((_, i) => i !== index)
            );
          }}
          className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
        >
          ✕
        </button>
      </div>
    ))}
  </div>
)}
  <p className="mt-2 text-xs text-gray-500">
    최대 3장, jpg/jpeg/png/webp 가능. 업로드 전에 자동으로 용량이 줄어듭니다.
  </p>

  {images.length > 0 && (
    <ul className="mt-3 space-y-2 text-xs text-gray-600">
      {images.map((file) => (
        <li
          key={`${file.name}-${file.size}`}
          className="rounded-lg border bg-gray-50 px-3 py-2"
        >
          📷{file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
        </li>
      ))}
    </ul>
  )}
</div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "등록 중..." : "게시글 등록"}
        </button>
      </form>
    </div>
  );
}