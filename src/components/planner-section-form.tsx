"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, ArrowRight, LayoutDashboard, Save } from "lucide-react";

import { savePlannerNotesAction } from "@/lib/supabase/actions";

const notesSchema = Yup.object().shape({
  fields: Yup.array()
    .of(
      Yup.object({
        key: Yup.string().required(),
        label: Yup.string().required(),
        value: Yup.string().min(10, "Isi bagian ini minimal 10 karakter.").required("Bagian ini wajib diisi."),
      }),
    )
    .required(),
});

type NotesField = {
  key: string;
  label: string;
  hint: string;
  value: string;
};

export function PlannerSectionForm({
  title,
  description,
  fields,
  prevHref,
  nextHref,
}: {
  title: string;
  description: string;
  fields: NotesField[];
  prevHref?: string;
  nextHref?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { fields },
    validationSchema: notesSchema,
    onSubmit(values, helpers) {
      startTransition(async () => {
        const payload = Object.fromEntries(values.fields.map((field) => [field.key, field.value]));
        const result = await savePlannerNotesAction(payload);
        helpers.setStatus(result.message);
      });
    },
  });

  return (
    <div className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
      <article className="neo-panel p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="section-kicker">Isi detail fitur</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800 sm:text-3xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
          </div>
          <Link href="/dashboard" className="neo-button-secondary responsive-action whitespace-nowrap">
            <LayoutDashboard size={16} />
            Kembali ke ringkasan
          </Link>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4">
          {formik.values.fields.map((field, index) => (
            <div key={field.key}>
              <label className="neo-label" htmlFor={field.key}>{field.label}</label>
              <p className="mb-3 text-sm leading-7 text-slate-500">{field.hint}</p>
              <textarea
                id={field.key}
                name={`fields.${index}.value`}
                className="neo-input min-h-40 resize-none"
                value={formik.values.fields[index]?.value ?? ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.fields?.[index]?.value && typeof formik.errors.fields?.[index] === "object" && formik.errors.fields?.[index]?.value ? (
                <p className="neo-field-error">{formik.errors.fields[index]?.value}</p>
              ) : null}
            </div>
          ))}

          <div className="editor-actions">
            <button type="submit" className="neo-button-primary responsive-action" disabled={isPending}>
              <Save size={16} />
              {isPending ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </div>
          {formik.status ? <p className="text-sm text-slate-500">{String(formik.status)}</p> : null}
        </form>
      </article>

      <article className="neo-panel p-5 sm:p-6">
        <div>
          <p className="section-kicker">Panduan singkat</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Kerjakan satu bagian lalu lanjut</h2>
        </div>

        <div className="mt-6 space-y-3">
          {formik.values.fields.map((field) => (
            <div key={field.key} className="neo-panel-inset p-4">
              <p className="text-sm font-semibold text-slate-500">{field.label}</p>
              <p className="mt-2 text-sm leading-7 text-slate-700 whitespace-pre-line break-words">{field.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Link href="/dashboard" className="neo-button-secondary w-full justify-center">
            <LayoutDashboard size={16} />
            Ringkasan
          </Link>
          {prevHref ? (
            <Link href={prevHref} className="neo-button-secondary w-full justify-center">
              <ArrowLeft size={16} />
              Kembali
            </Link>
          ) : <div className="hidden md:block" />}
          {nextHref ? (
            <Link href={nextHref} className="neo-button-primary w-full justify-center">
              Lanjut
              <ArrowRight size={16} />
            </Link>
          ) : <div className="hidden md:block" />}
        </div>
      </article>
    </div>
  );
}

