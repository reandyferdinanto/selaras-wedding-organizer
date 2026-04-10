import Link from "next/link";
import { LockKeyhole, MoveRight } from "lucide-react";

import { AuthNotice } from "@/components/auth-notice";
import { LoginForm } from "@/components/login-form";
import { DUMMY_EMAIL, DUMMY_PASSWORD } from "@/lib/demo-account";
import { authModeEnabled } from "@/lib/env";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(
  value: string | string[] | undefined,
  fallback = "",
): string {
  return Array.isArray(value) ? value[0] ?? fallback : value ?? fallback;
}

function LoginIllustration() {
  return (
    <svg
      aria-hidden="true"
      className="auth-illustration"
      viewBox="0 0 360 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M76 218H284" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      <path d="M95 218V96C95 75 112 58 133 58H227C248 58 265 75 265 96V218" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
      <path d="M128 122H232M128 158H202" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      <path d="M180 58V38" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      <path d="M145 38H215" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      <path d="M236 193C251.464 193 264 180.464 264 165C264 149.536 251.464 137 236 137C220.536 137 208 149.536 208 165C208 180.464 220.536 193 236 193Z" stroke="currentColor" strokeWidth="9" />
      <path d="M236 163V151M236 163L245 172" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const message = pickParam(params.message);
  const email = pickParam(params.email, DUMMY_EMAIL);

  return (
    <main className="page-shell">
      <section className="auth-shell mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="neo-panel auth-aside flex flex-col justify-between p-6 sm:p-8">
          <div>
            <span className="neo-badge">
              <LockKeyhole size={14} />
              Masuk akun
            </span>
            <h1 className="mt-5 max-w-lg text-4xl font-extrabold tracking-[-0.04em] text-slate-800">
              Masuk untuk melanjutkan persiapan pernikahan Anda.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
              Semua rencana acara, catatan vendor, dan daftar tugas keluarga akan lebih mudah dipantau dari satu tempat.
            </p>
          </div>

          <div className="auth-illustration-panel mt-8">
            <LoginIllustration />
          </div>

          <div className="auth-note-stack mt-10">
            {[
              "Satu ruang kerja untuk pasangan, keluarga, dan panitia inti.",
              "Tahapan persiapan mengikuti alur pernikahan yang umum dipakai di Indonesia.",
              "Akun contoh bisa langsung dipakai untuk melihat alur utama aplikasi.",
            ].map((item) => (
              <div key={item} className="neo-panel-inset p-4 text-sm leading-7 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="neo-panel auth-main p-6 sm:p-8">
          <div className="section-heading">
            <span className="neo-icon">
              <MoveRight size={18} />
            </span>
            <div>
              <p className="section-kicker">Masuk</p>
              <h2>Masuk dengan email</h2>
            </div>
          </div>

          <AuthNotice message={message} enabled={authModeEnabled} />

          <div className="dashboard-info-note mt-5 neo-panel-inset p-4 text-sm leading-7 text-slate-600">
            <p className="font-semibold text-slate-700">Akun contoh sementara</p>
            <p className="mt-2">
              Email: <span className="font-semibold text-slate-800">{DUMMY_EMAIL}</span>
            </p>
            <p>
              Password: <span className="font-semibold text-slate-800">{DUMMY_PASSWORD}</span>
            </p>
          </div>

          <LoginForm defaultEmail={email} />

          <div className="dashboard-info-note mt-4 neo-panel-inset p-4 text-sm leading-7 text-slate-600">
            Belum punya akun?{" "}
            <Link href="/register" className="font-bold text-slate-700">
              Buat akun baru
            </Link>
            .
          </div>

          <div className="mt-6 text-sm leading-7 text-slate-500">
            {authModeEnabled
              ? "Anda bisa memakai akun contoh atau akun yang sudah terdaftar."
              : "Sementara ini, gunakan akun contoh untuk masuk dan mencoba alur aplikasi."}
          </div>
        </div>
      </section>
    </main>
  );
}
