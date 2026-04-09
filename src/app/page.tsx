import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  CalendarDays,
  FileCheck2,
  HeartHandshake,
  Landmark,
  LayoutPanelTop,
  NotebookPen,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import {
  cultureTemplates,
  featureHighlights,
  phasePlan,
  vendorTracks,
} from "@/lib/wedding-plan";

const capabilityTiles = [
  {
    title: "Timeline adaptif Indonesia",
    description:
      "Mulai dari lamaran, administrasi KUA atau Dukcapil, sampai resepsi dan penutupan panitia keluarga.",
    icon: CalendarDays,
  },
  {
    title: "Budget dan vendor yang transparan",
    description:
      "Pantau DP, pelunasan, catatan kontrak, dan status vendor inti agar keputusan keluarga tetap sinkron.",
    icon: WalletCards,
  },
  {
    title: "Guest management yang lebih tenang",
    description:
      "Siapkan RSVP digital, tamu prioritas, dan flow resepsi tanpa spreadsheet yang berantakan.",
    icon: HeartHandshake,
  },
  {
    title: "Rangkaian acara yang mudah dibaca",
    description:
      "Workspace setelah login dirancang seperti membaca dokumen premium: fokus, lapang, dan mudah dipindai.",
    icon: BookOpenText,
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-16 pt-6 sm:px-8 lg:px-10">
      <section className="neo-surface hero-grid overflow-hidden rounded-[38px] px-6 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <header className="flex flex-col gap-5 border-b border-[rgba(255,255,255,0.8)] pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="neo-badge">
              <CalendarDays size={14} />
              Wedding Planner Indonesia
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-[-0.04em] text-slate-800 sm:text-5xl lg:text-6xl">
              Ruang kerja pernikahan yang terasa tenang, rapi, dan siap dipakai
              keluarga besar.
            </h1>
          </div>
          <div className="max-w-md text-sm leading-7 text-slate-600 sm:text-base">
            Dirancang agar nyaman dipakai melihat rencana acara, daftar tugas,
            anggaran, dan kebutuhan keluarga dalam satu tempat yang rapi dan
            mudah dibaca.
          </div>
        </header>

        <div className="grid gap-10 pt-8 lg:grid-cols-[1.25fr_0.95fr]">
          <div className="space-y-7">
            <div className="space-y-4">
              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Versi awal ini fokus pada kebutuhan paling penting: mengenalkan
                fitur utama, membantu masuk ke akun, dan menyiapkan halaman
                kerja untuk mengatur rangkaian acara pernikahan.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="neo-button-primary">
                  Mulai project
                  <ArrowRight size={18} />
                </Link>
                <Link href="/login" className="neo-button-secondary">
                  Masuk ke akun
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {capabilityTiles.map(({ title, description, icon: Icon }) => (
                <article key={title} className="neo-panel p-5">
                  <div className="neo-icon mb-4">
                    <Icon size={18} />
                  </div>
                  <h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-800">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className="neo-panel flex flex-col gap-5 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
                  Gambaran halaman utama
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">
                  Rencana acara yang bisa langsung dilengkapi
                </h2>
              </div>
              <div className="neo-icon">
                <LayoutPanelTop size={18} />
              </div>
            </div>

            <div className="neo-panel-inset space-y-4 p-4">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Rencana utama</span>
                <span>12 bulan</span>
              </div>
              {phasePlan.slice(0, 4).map((phase) => (
                <div
                  key={phase.slug}
                  className="rounded-[22px] border border-[rgba(255,255,255,0.75)] bg-[rgba(255,255,255,0.32)] px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-slate-700">
                        {phase.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {phase.window}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-500">
                      {phase.tasks.length} task
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="neo-panel px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Tamu
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-800">
                  320
                </p>
              </div>
              <div className="neo-panel px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Vendor
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-800">
                  11
                </p>
              </div>
              <div className="neo-panel px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Sisa budget
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-800">
                  38%
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="neo-panel p-6 sm:p-7">
          <div className="section-heading">
            <span className="neo-icon">
              <HeartHandshake size={18} />
            </span>
            <div>
              <p className="section-kicker">Yang paling penting sebelum login</p>
              <h2>Fitur inti yang langsung menjawab problem pasangan</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {featureHighlights.map((item) => (
              <div
                key={item.title}
                className="neo-panel-inset flex items-start gap-4 p-4"
              >
                <div className="neo-icon shrink-0">
                  <item.icon size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="neo-panel p-6 sm:p-7">
          <div className="section-heading">
            <span className="neo-icon">
              <NotebookPen size={18} />
            </span>
            <div>
              <p className="section-kicker">Roadmap awal</p>
              <h2>Tahap proyek diisi sedikit demi sedikit agar lebih stabil</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {phasePlan.map((phase, index) => (
              <div key={phase.slug} className="flex gap-4">
                <div className="flex w-12 flex-col items-center">
                  <div className="neo-icon h-11 w-11 text-sm font-extrabold">
                    {index + 1}
                  </div>
                  {index < phasePlan.length - 1 ? (
                    <div className="mt-3 h-full w-px bg-[rgba(124,140,163,0.3)]" />
                  ) : null}
                </div>
                <div className="neo-panel-inset mb-5 flex-1 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-extrabold text-slate-800">
                      {phase.title}
                    </h3>
                    <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      {phase.window}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                    {phase.tasks.map((task) => (
                      <li key={task} className="flex gap-3">
                        <BadgeCheck
                          size={16}
                          className="mt-1 shrink-0 text-slate-500"
                        />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-10 grid gap-5 xl:grid-cols-[1fr_1fr_0.92fr]">
        <article className="neo-panel p-6">
          <div className="section-heading">
            <span className="neo-icon">
              <Landmark size={18} />
            </span>
            <div>
              <p className="section-kicker">Template budaya</p>
              <h2>Pilih struktur awal lalu kustom sesuai keluarga</h2>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {cultureTemplates.map((template) => (
              <div key={template.name} className="neo-panel-inset p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-extrabold text-slate-800">
                    {template.name}
                  </h3>
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-500">
                    {template.focus}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {template.summary}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="neo-panel p-6">
          <div className="section-heading">
            <span className="neo-icon">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="section-kicker">Administrasi</p>
              <h2>Checklist legal yang tidak boleh tertinggal</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {[
              "Pendaftaran kehendak nikah minimal 10 hari kerja sebelum akad.",
              "Bimbingan perkawinan dan arsip sertifikat untuk jalur Muslim.",
              "Upload dokumen inti: KTP, KK, akta lahir, surat pengantar, dan dokumen kondisi khusus.",
              "Catatan tindak lanjut Dukcapil setelah pemberkatan untuk jalur non-Muslim.",
            ].map((item) => (
              <div key={item} className="neo-panel-inset flex gap-3 p-4">
                <FileCheck2 size={17} className="mt-1 shrink-0 text-slate-500" />
                <p className="text-sm leading-7 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="neo-panel p-6">
          <div className="section-heading">
            <span className="neo-icon">
              <WalletCards size={18} />
            </span>
            <div>
              <p className="section-kicker">Vendor fokus</p>
              <h2>Area yang biasanya paling cepat memengaruhi budget</h2>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {vendorTracks.map((item) => (
              <div key={item.title} className="neo-panel-inset p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-extrabold text-slate-800">
                    {item.title}
                  </h3>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    {item.priority}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
