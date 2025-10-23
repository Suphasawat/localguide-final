"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "@/app/components/Logo";
import Footer from "@/app/components/Footer";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const success = await login({ email: formData.email, password: formData.password });
      if (success) {
        router.push("/dashboard");
      } else {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <>
      <Logo />

      <div className="min-h-[calc(100dvh-120px)] flex items-center justify-center bg-gray-100 px-4 py-12">
        <div className="w-full max-w-xl rounded-[24px] border border-gray-300 bg-white shadow-sm">
          {/* หัวการ์ด */}
          <div className="px-8 pt-8 pb-4 md:px-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900">เข้าสู่ระบบ</h1>
            <p className="mt-2 text-sm font-semibold text-gray-800">
              กรุณาใส่อีเมลและรหัสผ่านของคุณเพื่อเข้าสู่ระบบ
            </p>
          </div>
          <hr className="border-gray-300" />

          {/* ฟอร์ม */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6 md:px-10 md:pt-8 space-y-5">
            {error ? (
              <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {/* อีเมล */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
                ชื่อผู้ใช้งาน (อีเมล)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                className="mt-2 w-full rounded-full border-2 border-gray-300 px-5 py-3 text-[15px] text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-0"
              />
            </div>

            {/* รหัสผ่าน */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
                รหัสผ่าน
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="รหัสผ่าน"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-full border-2 border-gray-300 px-5 py-3 pr-24 text-[15px] text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-3 my-1 rounded-full border border-gray-300 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {showPassword ? "ซ่อน" : "แสดง"}
                </button>
              </div>
              <div className="mt-2">
                <Link href="/auth/forgot-password" className="text-sm font-semibold text-blue-700 hover:underline">
                  ลืมรหัสผ่าน
                </Link>
              </div>
            </div>

            {/* ปุ่มแอ็กชัน */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-blue-700 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60"
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>

              <Link
                href="/auth/register"
                className="rounded-full border-2 border-blue-700 px-6 py-3 text-sm font-extrabold text-blue-700 transition hover:bg-blue-50"
              >
                ลงทะเบียน
              </Link>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
