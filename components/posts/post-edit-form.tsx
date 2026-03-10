"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_COUNT,
  MAX_ORIGINAL_IMAGE_SIZE_MB,
  compressImage,
} from "@/lib/image";

interface PostEditFormProps {
  postId: string;
}

interface ExistingImage {
  id: string;
  image_url: string;
  sort_order: number;
}

function extractStoragePathFromPublicUrl(url: string) {
  const marker = "/storage/v1/object/public/post-images/";
  const index = url.indexOf(marker);

  if (index === -1) return null;

  return url.slice(index + marker.length);
}

export default function PostEditForm({ postId }: PostEditFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);

  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleExistingImages = useMemo(() => {
    return existingImages.filter((image) => !deletedImageIds.includes(image.id));
  }, [existingImages, deletedImageIds]);

  const totalImageCount = visibleExistingImages.length + newImages.length;

  const fetchPost = async () => {
    setLoading(true);
    setError(null);

    try {
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
        .select(`
          id,
          user_id,
          title,
          description,
          price,
          is_free,
          post_images (
            id,
            image_url,
            sort_order
          )
        `)
        .eq("id", postId)
        .maybeSingle();

      if (error || !data) {
        setError("게시글을 불러오지 못했습니다.");
        setLoading(false);
        return;
      }

      if (data.user_id !== user.id) {
        setError("본인이 작성한 게시글만 수정할 수 있습니다.");
        setLoading(false);
        return;
      }

      setTitle(data.title);
      setDescription(data.description);
      setIsFree(data.is_free);
      setPrice(String(data.price));
      setExistingImages(
        [...(data.post_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)
      );
    } catch {
      setError("게시글을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

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

    if (totalImageCount > MAX_IMAGE_COUNT) {
      return `이미지는 최대 ${MAX_IMAGE_COUNT}장까지 유지할 수 있습니다.`;
    }

    return null;
  }

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);

    if (selectedFiles.length === 0) return;

    for (const file of selectedFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError("jpg, jpeg, png, webp 파일만 업로드할 수 있습니다.");
        return;
      }

      const fileSizeMb = file.size / (1024 * 1024);
      if (fileSizeMb > MAX_ORIGINAL_IMAGE_SIZE_MB) {
        setError(`이미지 1장당 최대 ${MAX_ORIGINAL_IMAGE_SIZE_MB}MB까지 가능합니다.`);
        return;
      }
    }

    const nextCount =
      visibleExistingImages.length + newImages.length + selectedFiles.length;

    if (nextCount > MAX_IMAGE_COUNT) {
      setError(`이미지는 최대 ${MAX_IMAGE_COUNT}장까지 업로드할 수 있습니다.`);
      return;
    }

    setError(null);
setNewImages((prev) => [...prev, ...selectedFiles]);

const previewUrls = selectedFiles.map((file) =>
  URL.createObjectURL(file)
);

setNewImagePreviews((prev) => [...prev, ...previewUrls]);
  };

  const handleRemoveExistingImage = (imageId: string) => {
    setDeletedImageIds((prev) => [...prev, imageId]);
  };

  const handleRestoreExistingImage = (imageId: string) => {
    setDeletedImageIds((prev) => prev.filter((id) => id !== imageId));
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteMarkedExistingImages = async () => {
    if (deletedImageIds.length === 0) return;

    const targets = existingImages.filter((image) =>
      deletedImageIds.includes(image.id)
    );

    const filePaths = targets
      .map((image) => extractStoragePathFromPublicUrl(image.image_url))
      .filter((path): path is string => Boolean(path));

    if (filePaths.length > 0) {
      const { error: storageDeleteError } = await supabase.storage
        .from("post-images")
        .remove(filePaths);

      if (storageDeleteError) {
        throw new Error(`기존 이미지 파일 삭제 실패: ${storageDeleteError.message}`);
      }
    }

    const { error: dbDeleteError } = await supabase
      .from("post_images")
      .delete()
      .in("id", deletedImageIds);

    if (dbDeleteError) {
      throw new Error(`기존 이미지 정보 삭제 실패: ${dbDeleteError.message}`);
    }
  };

  const uploadNewImages = async (userId: string) => {
    if (newImages.length === 0) return;

    const baseSortOrder = visibleExistingImages.length;

    const uploadedRows: {
      post_id: string;
      image_url: string;
      sort_order: number;
    }[] = [];

    for (let i = 0; i < newImages.length; i += 1) {
      const originalFile = newImages[i];
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
        throw new Error(`새 이미지 업로드 실패: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      uploadedRows.push({
        post_id: postId,
        image_url: publicUrlData.publicUrl,
        sort_order: baseSortOrder + i,
      });
    }

    const { error: imageInsertError } = await supabase
      .from("post_images")
      .insert(uploadedRows);

    if (imageInsertError) {
      throw new Error(`새 이미지 정보 저장 실패: ${imageInsertError.message}`);
    }
  };

  const normalizeRemainingExistingImageOrder = async () => {
    const remaining = visibleExistingImages;

    for (let i = 0; i < remaining.length; i += 1) {
      const image = remaining[i];

      if (image.sort_order !== i) {
        const { error } = await supabase
          .from("post_images")
          .update({ sort_order: i })
          .eq("id", image.id);

        if (error) {
          throw new Error(`기존 이미지 순서 정리 실패: ${error.message}`);
        }
      }
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
    setSubmitting(true);

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

      const { error: updateError } = await supabase
        .from("posts")
        .update({
          title: title.trim(),
          description: description.trim(),
          price: finalPrice,
          is_free: isFree,
        })
        .eq("id", postId);

      if (updateError) {
        setError("게시글 수정 중 오류가 발생했습니다.");
        return;
      }

      await deleteMarkedExistingImages();
      await normalizeRemainingExistingImageOrder();
      await uploadNewImages(user.id);

      router.push(`/posts/${postId}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("게시글 수정 중 오류가 발생했습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">불러오는 중...</div>;
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">글 수정</h1>
        <p className="mt-2 text-sm text-gray-600">
          게시글 정보와 이미지를 수정할 수 있습니다.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && (
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
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-black disabled:bg-gray-100"
            />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium">기존 이미지</h2>

            {existingImages.length === 0 && (
              <p className="text-sm text-gray-500">등록된 이미지가 없습니다.</p>
            )}

            {existingImages.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {existingImages.map((image) => {
                  const isDeleted = deletedImageIds.includes(image.id);

                  return (
                    <div
                      key={image.id}
                      className={`rounded-xl border p-3 ${
                        isDeleted ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={image.image_url}
                          alt="기존 이미지"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <div className="mt-3">
                        {isDeleted ? (
                          <button
                            type="button"
                            onClick={() => handleRestoreExistingImage(image.id)}
                            className="rounded-lg border px-3 py-2 text-sm"
                          >
                            삭제 취소
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(image.id)}
                            className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            이미지 삭제
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        <div>
  <label className="mb-1 block text-sm font-medium">새 이미지 추가</label>

  <input
    id="newImages"
    type="file"
    accept="image/jpeg,image/jpg,image/png,image/webp"
    multiple
    onChange={handleNewImageChange}
    className="hidden"
  />

  <div className="flex items-center gap-3">
    <label
      htmlFor="newImages"
      className="inline-flex cursor-pointer items-center rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-100"
    >
      파일 선택
    </label>

    <span className="text-sm text-gray-500">
      {newImages.length > 0
        ? `${newImages.length}개 선택됨`
        : "선택된 파일 없음"}
    </span>
  </div>
{newImagePreviews.length > 0 && (
  <div className="mt-4 grid grid-cols-3 gap-3">
    {newImagePreviews.map((src, index) => (
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
            setNewImages((prev) => prev.filter((_, i) => i !== index));
            setNewImagePreviews((prev) =>
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
    전체 이미지는 최대 {MAX_IMAGE_COUNT}장까지 가능합니다. 업로드 전에 자동으로 용량이 줄어듭니다.
  </p>
</div>

          {newImages.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-medium">새로 추가할 이미지</h2>
              <div className="space-y-2">
                {newImages.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <span className="text-sm text-gray-700">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="rounded-lg border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      제거
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600">
            현재 유지 예정 이미지 수: {totalImageCount} / {MAX_IMAGE_COUNT}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "수정 중..." : "수정 완료"}
            </button>

            <button
              type="button"
              onClick={() => router.push(`/posts/${postId}`)}
              className="rounded-xl border px-4 py-3 text-sm font-medium"
            >
              취소
            </button>
          </div>
        </form>
      )}
    </div>
  );
}