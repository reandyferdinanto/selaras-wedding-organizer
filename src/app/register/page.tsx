import Link from "next/link";
import { BadgePlus, CalendarDays } from "lucide-react";

import { AuthNotice } from "@/components/auth-notice";
import { RegisterForm } from "@/components/register-form";
import { authModeEnabled } from "@/lib/env";

type RegisterPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(
  value: string | string[] | undefined,
  fallback = "",
): string {
  return Array.isArray(value) ? value[0] ?? fallback : value ?? fallback;
}

function RegisterIllustration() {
  return (
    <svg
      aria-hidden="true"
      className="auth-illustration"
      viewBox="0 0 360 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M82 215H278" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      <path d="M105 215V83C105 66.4315 118.431 53 135 53H225C241.569 53 255 66.4315 255 83V215" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
      <path d="M135 112H225M135 148H184" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      <path d="M144 53V33M216 53V33" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      <path d="M132 33H228" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      <path d="M221 182H279" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      <path d="M250 153V211" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      <path d="M87 93C72 77 72 55 87 42C102 55 102 77 87 93Z" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
      <path d="M273 93C258 77 258 55 273 42C288 55 288 77 273 93Z" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
    </svg>
  );
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = (await searchParams) ?? {};
  const message = pickParam(params.message);
  const fullName = pickParam(params.fullName);
  const email = pickParam(params.email);
  const weddingDate = pickParam(params.weddingDate, "2026-12-12");

  return (
    <main className="page-shell">
      <section className="auth-shell mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="neo-panel auth-main p-6 sm:p-8">
          <div className="section-heading">
            <span className="neo-icon">
              <BadgePlus size={18} />
            </span>
            <div>
              <p className="section-kicker">Buat akun</p>
              <h1>Mulai workspace pernikahan dari fondasi yang rapi</h1>
            </div>
          </div>

          <AuthNotice message={message} enabled={authModeEnabled} />

          <RegisterForm
            defaultValues={{
              fullName,
              email,
              weddingDate,
            }}
          />

          <div className="dashboard-info-note mt-4 neo-panel-inset p-4 text-sm leading-7 text-slate-600">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-bold text-slate-700">
              Masuk di sini
            </Link>
            .
          </div>
        </div>

        <div className="neo-panel auth-aside flex flex-col gap-5 p-6 sm:p-8">
          <span className="neo-badge">
            <CalendarDays size={14} />
            Tahap awal aplikasi
          </span>
          <h2 className="text-3xl font-extrabold tracking-[-0.04em] text-slate-800">
            Akun ini disiapkan untuk mulai mengatur rencana pernikahan secara bertahap.
          </h2>
          <div className="auth-illustration-panel">
            <RegisterIllustration />
          </div>
          <div className="auth-note-stack">
            {[
              "Onboarding awal pasangan dan tanggal pernikahan.",
              "Halaman dashboard untuk daftar fase acara dan tugas dasar.",
              "Fitur ditambahkan bertahap agar alurnya tetap rapi dan stabil saat dipakai.",
            ].map((item) => (
              <div key={item} className="neo-panel-inset p-4 text-sm leading-7 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
