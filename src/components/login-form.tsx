"use client";

import { useTransition } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import { DUMMY_EMAIL } from "@/lib/demo-account";
import { signInAction } from "@/lib/supabase/actions";

const loginSchema = Yup.object({
  email: Yup.string().email("Format email belum benar.").required("Email wajib diisi."),
  password: Yup.string().required("Password wajib diisi."),
});

type LoginFormProps = {
  defaultEmail: string;
};

export function LoginForm({ defaultEmail }: LoginFormProps) {
  const [isPending, startTransition] = useTransition();

  const formik = useFormik({
    initialValues: {
      email: defaultEmail || DUMMY_EMAIL,
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit(values) {
      startTransition(async () => {
        const formData = new FormData();
        formData.set("email", values.email);
        formData.set("password", values.password);
        await signInAction(formData);
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="neo-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder={DUMMY_EMAIL}
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
          placeholder="Masukkan password"
          className="neo-input"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.password && formik.errors.password ? (
          <p className="neo-field-error">{formik.errors.password}</p>
        ) : null}
      </div>
      <button type="submit" className="neo-button-primary w-full justify-center" disabled={isPending}>
        {isPending ? "Memproses..." : "Masuk ke halaman utama"}
      </button>
    </form>
  );
}
