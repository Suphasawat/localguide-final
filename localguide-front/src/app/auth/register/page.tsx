"use client";
import { useState } from "react";
import { register as registerApi } from "../../services/auth.service";
import { useRouter } from "next/navigation";

const Register = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }
    try {
      await registerApi({
        email: form.email,
        password: form.password,
      });
      router.push("/profile");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-rose-100 via-white to-blue-100">
      <div className="w-full max-w-md bg-white/90 p-8 rounded-2xl shadow-xl border border-rose-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-rose-100 rounded-full p-3 mb-2">
            <svg
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#e11d48"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-rose-700">สมัครสมาชิก</h1>
          <p className="text-gray-500 text-sm mt-1">
            สร้างบัญชีใหม่เพื่อใช้งาน Local Guide
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">
              อีเมล
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
              autoComplete="email"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">
              รหัสผ่าน
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
              autoComplete="new-password"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">
              ยืนยันรหัสผ่าน
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
              autoComplete="new-password"
            />
          </div>
          {error && (
            <div className="mb-4 text-red-600 text-center">{error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-rose-600 text-white py-2 rounded-lg font-semibold hover:bg-rose-700 transition shadow"
            disabled={loading}
          >
            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>
        </form>
        <div className="mt-6 text-center text-gray-500 text-sm">
          มีบัญชีอยู่แล้ว?{" "}
          <a href="/auth/login" className="text-rose-600 hover:underline">
            เข้าสู่ระบบ
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
