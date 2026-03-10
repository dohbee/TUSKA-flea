export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const MAX_IMAGE_COUNT = 3;
export const MAX_ORIGINAL_IMAGE_SIZE_MB = 10;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지를 불러오지 못했습니다."));
    };

    img.src = objectUrl;
  });
}

export async function compressImage(file: File): Promise<File> {
  const img = await loadImage(file);

  const maxSize = 1280;
  let { width, height } = img;

  if (width > height && width > maxSize) {
    height = Math.round((height * maxSize) / width);
    width = maxSize;
  } else if (height >= width && height > maxSize) {
    width = Math.round((width * maxSize) / height);
    height = maxSize;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("이미지 처리를 할 수 없습니다.");
  }

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.75);
  });

  if (!blob) {
    throw new Error("이미지 압축에 실패했습니다.");
  }

  const compressedFileName = file.name.replace(/\.[^.]+$/, "") + ".jpg";

  return new File([blob], compressedFileName, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}