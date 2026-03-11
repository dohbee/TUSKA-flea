"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }
      await ensureProfile();
      router.push("/posts");
      router.refresh();
    } catch (err) {
  console.error(err);

  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError("로그인 중 오류가 발생했습니다.");
  }
} finally {
  setLoading(false);
}
  };

  return (
    <div className="rounded-2xl border p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">로그인</h1>
        <p className="mt-2 text-sm text-gray-600">
          이메일과 비밀번호를 입력해주세요.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@ed.tus.ac.jp"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-black"
          />
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
            placeholder="비밀번호 입력"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        아직 계정이 없나요?{" "}
        <Link href="/signup" className="font-medium text-black underline">
          회원가입
        </Link>
      </div>
    </div>
  );
}