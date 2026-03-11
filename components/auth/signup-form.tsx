"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

type SignupType = "student" | "freshman";



export default function SignupForm() {
  const [signupType, setSignupType] = useState<SignupType>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contactKakaoId, setContactKakaoId] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validateForm() {
  if (!/^[가-힣]{2,5}$/.test(fullName)) {
    return "이름은 한글 2~5자로 입력해주세요.";
  }

  if (!email) {
    return "이메일을 입력해주세요.";
  }

  if (signupType === "student" && !email.endsWith("@ed.tus.ac.jp")) {
    return "학교 이메일(@ed.tus.ac.jp)만 가입 가능합니다.";
  }

  if (password.length < 8) {
    return "비밀번호는 8자 이상이어야 합니다.";
  }

  if (password !== confirmPassword) {
    return "비밀번호 확인이 일치하지 않습니다.";
  }

  if (!contactKakaoId) {
    return "카카오 ID를 입력해주세요.";
  }

  if (signupType === "freshman" && !inviteCode) {
    return "신입생 가입은 초대코드가 필요합니다.";
  }

  return null;
}

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const validationError = validateForm();

  if (validationError) {
    setError(validationError);
    setSuccessMessage(null);
    return;
  }

  setError(null);
  setSuccessMessage(null);
  setLoading(true);

  try {
    const authType = signupType === "student" ? "school_email" : "invite_code";
    const userStatus =
      signupType === "student" ? "verified_student" : "invited_freshman";

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          full_name: fullName,
          contact_kakao_id: contactKakaoId,
          auth_type: authType,
          user_status: userStatus,
          school_email:
            signupType === "student" ? email : null,
          invite_code:
            signupType === "freshman" ? inviteCode : null,
        },
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    setSuccessMessage(
      "회원가입이 완료되었습니다. 이메일 인증 링크를 확인해주세요."
    );

    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setContactKakaoId("");
    setInviteCode("");
  } catch (err) {
    setError("회원가입 중 오류가 발생했습니다.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="rounded-2xl border p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">회원가입</h1>
        <p className="mt-2 text-sm text-gray-600">
          TUSKA Flea 가입 유형을 선택하고 정보를 입력해주세요.
        </p>
      </div>

        {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">
            {error}
        </div>
        )}
        {successMessage && (
        <div className="mb-4 rounded-lg bg-green-100 px-4 py-2 text-sm text-green-700">
            {successMessage}
        </div>
        )}

      <div className="mb-6 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setSignupType("student")}
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            signupType === "student"
              ? "border-black bg-black text-white"
              : "border-gray-300 bg-white text-black"
          }`}
        >
          재학생 가입
        </button>

        <button
          type="button"
          onClick={() => setSignupType("freshman")}
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            signupType === "freshman"
              ? "border-black bg-black text-white"
              : "border-gray-300 bg-white text-black"
          }`}
        >
          신입생 가입
        </button>
      </div>
        
        

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium">
            이름
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="예: 홍길동"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-black"
          />
          <p className="mt-1 text-xs text-gray-500">
            한글 이름을 입력해주세요.
          </p>
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            {signupType === "student" ? "학교 이메일" : "이메일"}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={
              signupType === "student"
                ? "example@ed.tus.ac.jp"
                : "example@email.com"
            }
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-black"
          />
          {signupType === "student" && (
            <p className="mt-1 text-xs text-gray-500">
              @ed.tus.ac.jp 형식의 학교 이메일만 가입 가능합니다.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8자 이상 입력"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium"
          >
            비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label
            htmlFor="contactKakaoId"
            className="mb-1 block text-sm font-medium"
          >
            카카오 ID
          </label>
          <input
            id="contactKakaoId"
            type="text"
            value={contactKakaoId}
            onChange={(e) => setContactKakaoId(e.target.value)}
            placeholder="연락 가능한 카카오 ID"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        {signupType === "freshman" && (
          <div>
            <label
              htmlFor="inviteCode"
              className="mb-1 block text-sm font-medium"
            >
              초대코드
            </label>
            <input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="신입생용 초대코드 입력"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-black"
            />
          </div>
        )}

        <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
            {loading ? "가입 처리 중..." : "회원가입"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-medium text-black underline">
          로그인
        </Link>
      </div>
    </div>
  );
}

