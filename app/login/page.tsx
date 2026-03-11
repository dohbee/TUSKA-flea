import LoginForm from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      {message === "login_required" && (
        <div className="mb-4 rounded-lg bg-yellow-100 px-4 py-3 text-sm text-yellow-800">
          로그인 후 이용해주세요.
        </div>
      )}

      <LoginForm />
    </main>
  );
}