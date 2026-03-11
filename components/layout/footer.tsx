import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-white py-6">
      <div className="mx-auto max-w-5xl px-4 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} TUSKA Flea</p>

        <p className="mt-2">
          TUSKA Flea는 Tokyo University of Science Korean Association 학생
          커뮤니티를 위한 비공식 서비스입니다.
        </p>

        <div className="mt-3 flex justify-center gap-4">
          <Link href="/privacy" className="underline hover:text-gray-700">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}