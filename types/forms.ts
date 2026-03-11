export interface SignupFormValues {
  email: string;
  password: string;
  display_name: string;
  contact_kakao_id: string;
  invite_code?: string;
}

export interface CreatePostFormValues {
  title: string;
  description: string;
  price: number;
  is_free: boolean;
}