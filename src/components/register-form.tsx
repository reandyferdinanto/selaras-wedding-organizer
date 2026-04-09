"use client";

import { useTransition } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import { DatePickerField } from "@/components/date-field-preview";
import { signUpAction } from "@/lib/supabase/actions";

const registerSchema = Yup.object({
  fullName: Yup.string().min(2, "Nama minimal 2 karakter.").required("Nama lengkap wajib diisi."),
  weddingDate: Yup.string().required("Tanggal acara wajib dipilih."),
  email: Yup.string().email("Format email belum benar.").required("Email wajib diisi."),
  password: Yup.string().min(6, "Password minimal 6 karakter.").required("Password wajib diisi."),
});

type RegisterFormProps = {
  defaultValues: {
    fullName: string;
    weddingDate: string;
    email: string;
  };
};

export function RegisterForm({ defaultValues }: RegisterFormProps) {
  const [isPending, startTransition] = useTransition();

  const formik = useFormik({
    initialValues: {
      fullName: defaultValues.fullName,
      weddingDate: defaultValues.weddingDate,
      email: defaultValues.email,
      password: "",
    },
    validationSchema: registerSchema,
    onSubmit(values) {
      startTransition(async () => {
        const formData = new FormData();
        formData.set("fullName", values.fullName);
        formData.set("weddingDate", values.weddingDate);
        formData.set("email", values.email);
        formData.set("password", values.password);
        await signUpAction(formData);
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="neo-label" htmlFor="fullName">
            Nama lengkap
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Nama calon pengantin"
            className="neo-input"
            value={formik.values.fullName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.fullName && formik.errors.fullName ? (
            <p className="neo-field-error">{formik.errors.fullName}</p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <DatePickerField
            id="weddingDate"
            label="Tanggal acara"
            value={formik.values.weddingDate}
            onChange={(nextValue) => formik.setFieldValue("weddingDate", nextValue)}
            error={formik.errors.weddingDate}
            touched={formik.touched.weddingDate}
          />
        </div>
      </div>

      <div>
        <label className="neo-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="nama@contoh.com"
          className="neo-input"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.email && formik.errors.email ? (
          <p className="neo-field-error">{formik.errors.email}</p>
        ) : null}
      </div>

      <div>
        <label className="neo-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Minimal 6 karakter"
          className="neo-input"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.password && formik.errors.password ? (
          <p className="neo-field-error">{formik.errors.password}</p>
        ) : null}
      </div>

      <button
        type="submit"
        className="neo-button-primary w-full justify-center"
        disabled={isPending}
      >
        {isPending ? "Memproses..." : "Buat akun dan lanjut"}
      </button>
    </form>
  );
}
