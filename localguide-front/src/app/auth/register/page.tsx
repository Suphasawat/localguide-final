"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "@/app/components/Logo";
import Footer from "@/app/components/Footer";

type FieldErrors = Partial<{
  email: string;
  password: string;
  confirmPassword: string;
}>;

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  function isSimpleEmail(value: string): boolean {
    const trimmed = value.trim();
    const atIndex = trimmed.indexOf("@");
    const lastDot = trimmed.lastIndexOf(".");

    if (trimmed.length === 0) return false;
    if (atIndex < 1) return false;
    if (lastDot < atIndex + 2) return false;
    if (lastDot >= trimmed.length - 1) return false;
    return true;
  }

  function validate(values = formData): FieldErrors {
    const e: FieldErrors = {};

    if (values.email.trim().length === 0) {
      e.email = "กรุณากรอกอีเมล";
    } else if (isSimpleEmail(values.email) === false) {
      e.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (values.password.length === 0) {
      e.password = "กรุณากรอกรหัสผ่าน";
    } else {
      let hasLower = false;
      let hasUpper = false;
      let hasNumber = false;

      for (let i = 0; i < values.password.length; i++) {
        const ch = values.password[i];
        if (ch >= "a" && ch <= "z") { hasLower = true; }
        else if (ch >= "A" && ch <= "Z") { hasUpper = true; }
        else if (ch >= "0" && ch <= "9") { hasNumber = true; }
      }

      if (values.password.length < 8) { e.password = "อย่างน้อย 8 ตัวอักษร"; }
      else if (hasLower === false) { e.password = "ต้องมีตัวอักษรพิมพ์เล็ก (a-z)"; }
      else if (hasUpper === false) { e.password = "ต้องมีตัวอักษรพิมพ์ใหญ่ (A-Z)"; }
      else if (hasNumber === false) { e.password = "ต้องมีตัวเลขอย่างน้อย 1 ตัว"; }
    }

    if (values.confirmPassword.length === 0) {
      e.confirmPassword = "กรุณายืนยันรหัสผ่าน";
    } else if (values.confirmPassword !== values.password) {
      e.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }

    return e;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => { return { ...prev, [name]: value }; });

    if (errors[name as keyof FieldErrors]) {
      setErrors((prev) => { return { ...prev, [name]: "" }; });
    }
    if (submitError) {
      setSubmitError("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading === true) { return; }

    setSubmitError("");

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) { return; }

    setLoading(true);
    try {
      const ok = await register({
        email: formData.email.trim(),
        password: formData.password,
      });
      if (ok === true) {
        router.push("/auth/login?message=registration-success");
      } else {
        setSubmitError("เกิดข้อผิดพลาดในการสมัครสมาชิก");
      }
    } catch {
      setSubmitError("เกิดข้อผิดพลาดในการสมัครสมาชิก");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Logo />

      <div className="min-h-[calc(100dvh-120px)] bg-gray-100 px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white border border-gray-300 rounded-[24px] shadow-sm">
          <div className="px-8 pt-8 pb-4 md:px-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900">ลงทะเบียนผู้ใช้ใหม่</h1>
          </div>
          <hr className="border-gray-300" />

          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6 md:px-10 md:pt-8 space-y-6">
            {submitError && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {/* อีเมล */}
            <div>
              <p className="mb-2 text-sm font-extrabold text-blue-800">ข้อมูลผู้ใช้งาน</p>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="อีเมล"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className={`w-full h-12 rounded-full border-2 px-5 text-[15px] placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-600 ${errors.email ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* รหัสผ่าน */}
            <div>
              <p className="mb-2 text-sm font-extrabold text-blue-800">สร้างรหัสผ่าน</p>

              {/* ใส่เฉพาะ input+ปุ่มไว้ใน relative */}
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="รหัสผ่าน"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={`w-full h-12 rounded-full border-2 px-5 pr-28 text-[15px] placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-600 ${errors.password ? "border-red-500" : "border-gray-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 inset-y-0 my-auto flex items-center justify-center h-9 px-3 rounded-full border text-xs font-semibold leading-none border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                >
                  {showPassword ? "ซ่อน" : "แสดง"}
                </button>
              </div>

              {/* ย้ายข้อความกติกา/เออเรอร์ออกมาไว้นอก relative */}
              {errors.password ? (
                <p className="mt-2 text-xs text-red-600">{errors.password}</p>
              ) : (
                <p className="mt-2 text-xs text-gray-500">อย่างน้อย 8 ตัวอักษร และมี a-z, A-Z, 0-9 อย่างละ 1</p>
              )}
            </div>

            {/* ยืนยันรหัสผ่าน */}
            <div>
              <p className="mb-2 text-sm font-extrabold text-blue-800">ยืนยันรหัสผ่าน</p>

              {/* input+ปุ่มใน relative */}
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="ยืนยันรหัสผ่าน"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={`w-full h-12 rounded-full border-2 px-5 pr-28 text-[15px] placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-600 ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 inset-y-0 my-auto flex items-center justify-center h-9 px-3 rounded-full border text-xs font-semibold leading-none border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                >
                  {showConfirm ? "ซ่อน" : "แสดง"}
                </button>
              </div>

              {/* ข้อความเออเรอร์อยู่นอก relative เช่นกัน */}
              {errors.confirmPassword && (
                <p className="mt-2 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* ปุ่มส่ง */}
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
                <Link href="/auth/login" className="font-semibold text-blue-700 hover:underline">เข้าสู่ระบบ</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}
