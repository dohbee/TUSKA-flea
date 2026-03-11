export type UserStatus =
  | "pending"
  | "verified_student"
  | "invited_freshman"
  | "suspended";

export type AuthType = "school_email" | "invite_code";

export interface Profile {
  id: string;
  display_name: string;
  school_email: string | null;
  user_status: UserStatus;
  auth_type: AuthType;
  contact_kakao_id: string | null;
  created_at: string;
  updated_at: string;
}