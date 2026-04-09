"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  CalendarRange,
  CheckCheck,
  ChevronRight,
  CircleDollarSign,
  FileText,
  PencilLine,
  Save,
  Users,
  X,
} from "lucide-react";

import { budgetBuckets, phasePlan, vendorTracks, weddingMoments } from "@/lib/wedding-plan";

type PhaseItem = (typeof phasePlan)[number];
type MomentItem = (typeof weddingMoments)[number];
type BudgetItem = (typeof budgetBuckets)[number];
type VendorItem = (typeof vendorTracks)[number];

const nextStepsSeed = [
  "Tambahkan data proyek, tahapan acara, dan daftar tugas agar bisa diisi langsung.",
  "Hubungkan pendaftaran akun dengan pembuatan rencana pernikahan awal.",
  "Sediakan pengaturan acara agar pasangan bisa menambah rangkaian adat atau acara keluarga sendiri.",
  "Lengkapi modul tamu, vendor, dan anggaran secara bertahap.",
];

const editorSchema = Yup.object({
  value: Yup.string().trim().min(10, "Isi perubahan minimal 10 karakter.").required("Bagian ini belum boleh kosong."),
});

function formatPhases(items: PhaseItem[]) {
  return items.map((item) => `${item.title} | ${item.window} | ${item.status} | ${item.tasks.join("; ")}`).join("\n");
}

function parsePhases(value: string) {
  return value.split("\n").map((line, index) => {
    const [title, window, status, tasks] = line.split("|").map((item) => item.trim());
    return {
      slug: `${title || "tahap"}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: title || `Tahap ${index + 1}`,
      window: window || "Belum diatur",
      status: status || "Planned",
      tasks: (tasks || "").split(";").map((item) => item.trim()).filter(Boolean),
    } satisfies PhaseItem;
  }).filter((item) => item.title);
}

function formatMoments(items: MomentItem[]) {
  return items.map((item) => `${item.title} | ${item.timeframe} | ${item.description}`).join("\n");
}

function parseMoments(value: string) {
  return value.split("\n").map((line) => {
    const [title, timeframe, description] = line.split("|").map((item) => item.trim());
    return { title: title || "Acara baru", timeframe: timeframe || "Belum diatur", description: description || "" } satisfies MomentItem;
  }).filter((item) => item.description);
}

function formatBudgets(items: BudgetItem[]) {
  return items.map((item) => `${item.name} | ${item.notes}`).join("\n");
}

function parseBudgets(value: string) {
  return value.split("\n").map((line) => {
    const [name, notes] = line.split("|").map((item) => item.trim());
    return { name: name || "Kelompok baru", notes: notes || "" } satisfies BudgetItem;
  }).filter((item) => item.notes);
}

function formatVendors(items: VendorItem[]) {
  return items.map((item) => `${item.title} | ${item.priority} | ${item.description}`).join("\n");
}

function parseVendors(value: string) {
  return value.split("\n").map((line) => {
    const [title, priority, description] = line.split("|").map((item) => item.trim());
    return { title: title || "Vendor baru", priority: priority || "High", description: description || "" } satisfies VendorItem;
  }).filter((item) => item.description);
}

function formatSteps(items: string[]) {
  return items.join("\n");
}

function parseSteps(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function SectionEditor({
  title,
  hint,
  open,
  value,
  onCancel,
  onSave,
}: {
  title: string;
  hint: string;
  open: boolean;
  value: string;
  onCancel: () => void;
  onSave: (value: string) => void;
}) {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { value },
    validationSchema: editorSchema,
    onSubmit(values) {
      onSave(values.value);
    },
  });

  if (!open) return null;

  return (
    <form onSubmit={formik.handleSubmit} className="editor-form mt-5">
      <div className="editor-form-heading">
        <h3>{title}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-500">{hint}</p>
      </div>
      <label className="neo-label mt-4" htmlFor={title}>Edit data</label>
      <textarea
        id={title}
        name="value"
        className="neo-input min-h-40 resize-none"
        value={formik.values.value}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.value && formik.errors.value ? <p className="neo-field-error">{formik.errors.value}</p> : null}
      <div className="editor-actions">
        <button type="submit" className="neo-button-primary">
          <Save size={16} />
          Simpan perubahan
        </button>
        <button type="button" className="neo-button-secondary" onClick={onCancel}>
          <X size={16} />
          Batal
        </button>
      </div>
    </form>
  );
}

export function EditablePlanningBoard() {
  const [phases, setPhases] = useState<PhaseItem[]>(phasePlan);
  const [moments, setMoments] = useState<MomentItem[]>(weddingMoments);
  const [budgets, setBudgets] = useState<BudgetItem[]>(budgetBuckets);
  const [vendors, setVendors] = useState<VendorItem[]>(vendorTracks);
  const [steps, setSteps] = useState<string[]>(nextStepsSeed);
  const [activeEditor, setActiveEditor] = useState<"phases" | "moments" | "budgets" | "vendors" | "steps" | null>(null);
  const [message, setMessage] = useState("Perubahan dashboard saat ini tersimpan sementara selama halaman belum di-refresh.");

  return (
    <>
      <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <article className="neo-panel p-6">
          <div className="section-heading">
            <span className="neo-icon"><CalendarRange size={18} /></span>
            <div><p className="section-kicker">Rangkaian utama</p><h2>Tahapan utama persiapan</h2></div>
          </div>
          <div className="editor-toolbar mt-6">
            <p className="text-sm leading-7 text-slate-600">Tahapan ini bisa tetap diubah saat arah persiapan berubah.</p>
            <button type="button" className="neo-inline-button" onClick={() => setActiveEditor(activeEditor === "phases" ? null : "phases")}><PencilLine size={14} />Ubah tahapan</button>
          </div>
          <div className="mt-6 space-y-4">
            {phases.map((phase) => (
              <div key={phase.slug} className="neo-panel-inset p-5">
                <div className="flex flex-col gap-3 border-b border-[rgba(124,140,163,0.18)] pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><h3 className="text-lg font-extrabold text-slate-800">{phase.title}</h3><p className="mt-1 text-sm text-slate-500">{phase.window}</p></div>
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{phase.status}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {phase.tasks.map((task) => <div key={task} className="neo-panel px-4 py-3 text-sm leading-7 text-slate-600"><div className="flex gap-3"><CheckCheck size={16} className="mt-1 shrink-0 text-slate-500" /><span>{task}</span></div></div>)}
                </div>
              </div>
            ))}
          </div>
          <SectionEditor title="Ubah tahapan" hint="Gunakan format: Nama tahap | Rentang waktu | Status | Tugas 1; Tugas 2; Tugas 3" open={activeEditor === "phases"} value={formatPhases(phases)} onCancel={() => setActiveEditor(null)} onSave={(value) => { setPhases(parsePhases(value)); setActiveEditor(null); setMessage("Tahapan persiapan berhasil diperbarui sementara."); }} />
        </article>

        <div className="space-y-5">
          <article className="neo-panel p-6">
            <div className="section-heading">
              <span className="neo-icon"><FileText size={18} /></span>
              <div><p className="section-kicker">Momen acara</p><h2>Daftar acara yang siap dilengkapi</h2></div>
            </div>
            <div className="editor-toolbar mt-6">
              <p className="text-sm leading-7 text-slate-600">Susunan acara bisa diubah kapan saja tanpa mengulang dari awal.</p>
              <button type="button" className="neo-inline-button" onClick={() => setActiveEditor(activeEditor === "moments" ? null : "moments")}><PencilLine size={14} />Ubah daftar</button>
            </div>
            <div className="mt-6 space-y-3">
              {moments.map((moment, index) => <div key={`${moment.title}-${index}`} className="neo-panel-inset p-4"><div className="flex items-center justify-between gap-3"><h3 className="text-base font-extrabold text-slate-800">{moment.title}</h3><span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{moment.timeframe}</span></div><p className="mt-2 text-sm leading-7 text-slate-600">{moment.description}</p></div>)}
            </div>
            <SectionEditor title="Ubah momen acara" hint="Gunakan format: Nama acara | Waktu pelaksanaan | Keterangan" open={activeEditor === "moments"} value={formatMoments(moments)} onCancel={() => setActiveEditor(null)} onSave={(value) => { setMoments(parseMoments(value)); setActiveEditor(null); setMessage("Daftar acara berhasil diperbarui sementara."); }} />
          </article>

          <article className="neo-panel p-6">
            <div className="section-heading">
              <span className="neo-icon"><CircleDollarSign size={18} /></span>
              <div><p className="section-kicker">Budget awal</p><h2>Kelompok anggaran utama</h2></div>
            </div>
            <div className="editor-toolbar mt-6">
              <p className="text-sm leading-7 text-slate-600">Kelompok biaya utama juga bisa disesuaikan.</p>
              <button type="button" className="neo-inline-button" onClick={() => setActiveEditor(activeEditor === "budgets" ? null : "budgets")}><PencilLine size={14} />Ubah anggaran</button>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {budgets.map((bucket, index) => <div key={`${bucket.name}-${index}`} className="neo-panel-inset p-4"><p className="text-sm font-extrabold text-slate-800">{bucket.name}</p><p className="mt-2 text-sm leading-7 text-slate-600">{bucket.notes}</p></div>)}
            </div>
            <SectionEditor title="Ubah kelompok anggaran" hint="Gunakan format: Nama kelompok | Catatan" open={activeEditor === "budgets"} value={formatBudgets(budgets)} onCancel={() => setActiveEditor(null)} onSave={(value) => { setBudgets(parseBudgets(value)); setActiveEditor(null); setMessage("Kelompok anggaran berhasil diperbarui sementara."); }} />
          </article>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <article className="neo-panel p-6">
          <div className="section-heading">
            <span className="neo-icon"><Users size={18} /></span>
            <div><p className="section-kicker">Prioritas vendor</p><h2>Vendor yang perlu diprioritaskan lebih dulu</h2></div>
          </div>
          <div className="editor-toolbar mt-6">
            <p className="text-sm leading-7 text-slate-600">Susunan prioritas vendor bisa ikut berubah sesuai kebutuhan.</p>
            <button type="button" className="neo-inline-button" onClick={() => setActiveEditor(activeEditor === "vendors" ? null : "vendors")}><PencilLine size={14} />Ubah vendor</button>
          </div>
          <div className="mt-6 space-y-3">
            {vendors.map((item, index) => <div key={`${item.title}-${index}`} className="neo-panel-inset p-4"><div className="flex items-center justify-between gap-3"><h3 className="text-base font-extrabold text-slate-800">{item.title}</h3><span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-500">{item.priority}</span></div><p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p></div>)}
          </div>
          <SectionEditor title="Ubah prioritas vendor" hint="Gunakan format: Nama vendor | Prioritas | Keterangan" open={activeEditor === "vendors"} value={formatVendors(vendors)} onCancel={() => setActiveEditor(null)} onSave={(value) => { setVendors(parseVendors(value)); setActiveEditor(null); setMessage("Prioritas vendor berhasil diperbarui sementara."); }} />
        </article>

        <article className="neo-panel p-6">
          <div className="section-heading">
            <span className="neo-icon"><ChevronRight size={18} /></span>
            <div><p className="section-kicker">Langkah berikutnya</p><h2>Agenda lanjutan yang masih bisa diubah</h2></div>
          </div>
          <div className="editor-toolbar mt-6">
            <p className="text-sm leading-7 text-slate-600">Catatan kerja berikutnya tetap bisa diperbarui sesuai progres.</p>
            <button type="button" className="neo-inline-button" onClick={() => setActiveEditor(activeEditor === "steps" ? null : "steps")}><PencilLine size={14} />Ubah langkah</button>
          </div>
          <div className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
            {steps.map((item, index) => <div key={`${item}-${index}`} className="neo-panel-inset p-4">{item}</div>)}
          </div>
          <SectionEditor title="Ubah langkah berikutnya" hint="Gunakan satu baris untuk satu langkah kerja." open={activeEditor === "steps"} value={formatSteps(steps)} onCancel={() => setActiveEditor(null)} onSave={(value) => { setSteps(parseSteps(value)); setActiveEditor(null); setMessage("Langkah berikutnya berhasil diperbarui sementara."); }} />
          <div className="neo-panel-inset mt-5 p-4 text-sm leading-7 text-slate-600">{message}</div>
        </article>
      </section>
    </>
  );
}
