import { supabase } from "@/lib/supabase/client";

export async function ensureProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message ?? "사용자 정보를 불러오지 못했습니다.");
  }

  const { data: existingProfile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileFetchError) {
    throw new Error(`프로필 조회 실패: ${profileFetchError.message}`);
  }

  if (existingProfile) {
    return;
  }

  const metadata = user.user_metadata ?? {};

  const fullName = metadata.full_name ?? "";
  const contactKakaoId = metadata.contact_kakao_id ?? "";
  const authType = metadata.auth_type ?? "school_email";
  const userStatus = metadata.user_status ?? "pending";
  const schoolEmail = metadata.school_email ?? null;

  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    display_name: fullName,
    school_email: schoolEmail,
    user_status: userStatus,
    auth_type: authType,
    contact_kakao_id: contactKakaoId,
  });

  if (insertError) {
    throw new Error(`프로필 생성 실패: ${insertError.message}`);
  }
}