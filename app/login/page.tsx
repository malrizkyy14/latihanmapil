import { redirect } from "next/navigation";
import { getSessionUser } from "../lib/auth";
import { loginAction } from "../actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getSessionUser()) redirect("/");

  const params = await searchParams;
  const errorMessage =
    params.error === "invalid"
      ? "Username atau password salah."
      : params.error === "unavailable"
        ? "Login sementara tidak tersedia. Periksa konfigurasi server dan database."
        : params.error === "setup"
          ? "Login belum disiapkan. Pastikan tabel users sudah dibuat di database dan AUTH_SECRET sudah diatur."
        : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-xl bg-white p-6 shadow sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl font-bold text-indigo-700">
            S
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Masuk</h1>
          <p className="mt-1 text-sm text-slate-500">Masuk untuk mengelola daftar siswa</p>
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {errorMessage}
          </p>
        )}

        <form action={loginAction} className="space-y-4">
          <label className="block space-y-1.5 text-sm font-medium text-slate-700">
            Username
            <input
              name="username"
              autoComplete="username"
              className={inputClass}
              placeholder="Masukkan username"
              required
            />
          </label>

          <label className="block space-y-1.5 text-sm font-medium text-slate-700">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className={inputClass}
              placeholder="Masukkan password"
              required
            />
          </label>

          <button className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700 active:scale-[0.99]">
            Masuk
          </button>
        </form>
      </section>
    </main>
  );
}
