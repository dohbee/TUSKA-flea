export type PostStatus = "available" | "reserved" | "completed";

export interface Post {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  is_free: boolean;
  status: PostStatus;
  created_at: string;
  updated_at: string;
}

export interface PostImage {
  id: string;
  post_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface PostWithImages extends Post {
  post_images?: PostImage[];
}