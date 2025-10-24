"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "@/app/components/Logo";
import Footer from "@/app/components/Footer";

/** ชนิดของ error ต่อช่อง (เหลือเฉพาะอีเมลและรหัสผ่าน) */
type FieldErrors = Partial<{
  email: string;
  password: string;
}>;

export default function RegisterPage() {
  /* ----------------------- state ----------------------- */
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  /* -------------------- classes reuse ------------------- */
  const inputBase =
    "w-full h-12 rounded-full border-2 px-5 text-[15px] placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-600";
  const inputOk = "border-gray-300";
  const inputErr = "border-red-500";
  const toggleBtn =
    // จัดกึ่งกลางปุ่มแนวตั้งให้เป๊ะด้วย inset-y-0 + my-auto และกำหนด flex/leading-none
    "absolute right-3 inset-y-0 my-auto flex items-center justify-center h-8 px-3 rounded-full border text-xs font-semibold leading-none border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-sm";

  /* --------------------- validation --------------------- */
  function validate(values = formData): FieldErrors {
    const e: FieldErrors = {};

    // email
    if (!values.email.trim()) e.email = "กรุณากรอกอีเมล";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      e.email = "รูปแบบอีเมลไม่ถูกต้อง";

    // password rules: >=8, มี a-z, A-Z, 0-9
    if (!values.password) e.password = "กรุณากรอกรหัสผ่าน";
    else if (values.password.length < 8) e.password = "อย่างน้อย 8 ตัวอักษร";
    else if (!/[a-z]/.test(values.password))
      e.password = "ต้องมีตัวอักษรพิมพ์เล็ก (a-z)";
    else if (!/[A-Z]/.test(values.password))
      e.password = "ต้องมีตัวอักษรพิมพ์ใหญ่ (A-Z)";
    else if (!/[0-9]/.test(values.password))
      e.password = "ต้องมีตัวเลขอย่างน้อย 1 ตัว";

    return e;
  }

  /* -------------------- handlers -------------------- */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      // backend ต้องการแค่อีเมล/รหัสผ่านสำหรับสมัคร
      const ok = await register({
        email: formData.email,
        password: formData.password,
      });
      if (ok) router.push("/auth/login?message=registration-success");
      else setSubmitError("เกิดข้อผิดพลาดในการสมัครสมาชิก");
    } catch {
      setSubmitError("เกิดข้อผิดพลาดในการสมัครสมาชิก");
    } finally {
      setLoading(false);
    }
  }

  /* ----------------------- UI ----------------------- */
  return (
    <>
      <Logo />

      <div className="min-h-[calc(100dvh-120px)] bg-gray-100 px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white border border-gray-300 rounded-[24px] shadow-sm">
          {/* header */}
          <div className="px-8 pt-8 pb-4 md:px-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900">
              ลงทะเบียนผู้ใช้ใหม่
            </h1>
          </div>
          <hr className="border-gray-300" />

          <form
            onSubmit={handleSubmit}
            className="px-8 pb-8 pt-6 md:px-10 md:pt-8 space-y-6"
          >
            {/* submit error */}
            {submitError ? (
              <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}

            {/* ผู้ใช้งาน */}
            <div>
              <p className="mb-2 text-sm font-extrabold text-blue-800">
                ข้อมูลผู้ใช้งาน
              </p>

              {/* email */}
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="อีเมล"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${inputBase} ${
                    errors.email ? inputErr : inputOk
                  }`}
                />
                {errors.email ? (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                ) : null}
              </div>
            </div>

            {/* รหัสผ่าน */}
            <div>
              <p className="mb-2 text-sm font-extrabold text-blue-800">
                สร้างรหัสผ่าน
              </p>

              {/* password */}
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="รหัสผ่าน"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${inputBase} ${
                    errors.password ? inputErr : inputOk
                  } pr-24`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className={toggleBtn}
                >
                  {showPassword ? "ซ่อน" : "แสดง"}
                </button>

                {errors.password ? (
                  <p className="mt-2 text-xs text-red-600">{errors.password}</p>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">
                    อย่างน้อย 8 ตัวอักษร และมี a-z, A-Z, 0-9 อย่างละ 1
                  </p>
                )}
              </div>
            </div>

            {/* actions */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-blue-700 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60"
              >
                {loading ? "กำลังสมัครสมาชิก..." : "ลงทะเบียน"}
              </button>
              <p className="mt-3 text-center text-sm text-gray-600">
                มีบัญชีแล้ว?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-blue-700 hover:underline"
                >
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
