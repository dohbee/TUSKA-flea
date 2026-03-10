"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const navItems = [
  { href: "/posts", label: "게시글" },
  { href: "/posts/new", label: "글쓰기" },
  { href: "/my", label: "내 글" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/posts" className="text-lg font-bold">
            TUSKA Flea
          </Link>

          <nav className="hidden items-center gap-4 sm:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm ${
                    isActive ? "font-semibold text-black" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
        >
          로그아웃
        </button>
      </div>

      <nav className="mx-auto flex max-w-5xl gap-4 px-4 pb-3 sm:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm ${
                isActive ? "font-semibold text-black" : "text-gray-600"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}