"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function HomePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.replace("/posts");
        return;
      }

      setCheckingAuth(false);
    };

    checkSession();
  }, [router]);

  if (checkingAuth) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
        <p className="text-sm text-gray-500">불러오는 중...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-2xl">
        <p className="mb-3 text-sm font-medium text-gray-500">
          Tokyo University of Science Korean Association
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          TUSKA Flea
        </h1>

        <p className="mt-6 text-base leading-7 text-gray-600 sm:text-lg">
          학교 한국인 유학생들을 위한 중고거래·무료나눔 게시판입니다.
          전공책, 생활용품, 각종 물품을 쉽고 가볍게 나눌 수 있습니다.
        </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          href="/signup"
          className="whitespace-nowrap rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          회원가입
        </Link>

        <Link
          href="/login"
          className="whitespace-nowrap rounded-xl border px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          로그인
        </Link>
      </div>

        <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold">중고거래</h2>
            <p className="mt-2 text-sm text-gray-600">
              전공책, 생활용품 등을 학생끼리 편하게 거래할 수 있어요.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold">무료나눔</h2>
            <p className="mt-2 text-sm text-gray-600">
              더 이상 쓰지 않는 물건을 필요한 사람에게 무료로 나눌 수 있어요.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold">간단한 연락</h2>
            <p className="mt-2 text-sm text-gray-600">
              작성자의 카카오 ID를 통해 바로 연락하고 거래를 진행할 수 있어요.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}