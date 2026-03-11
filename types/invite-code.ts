export interface InviteCode {
  id: string;
  code: string;
  description: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}