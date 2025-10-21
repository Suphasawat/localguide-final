"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "@/app/components/Logo";
import Footer from "@/app/components/Footer";

/** ชนิดของ error ต่อช่อง (ไม่มี any) */
type FieldErrors = Partial<{
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  nationality: string;
  sex: string;
  password: string;
  confirmPassword: string;
}>;

export default function RegisterPage() {
  /* ----------------------- state ----------------------- */
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    first_name: "",
    last_name: "",
    nationality: "ไทย",
    sex: "",
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

  /* -------------------- classes reuse ------------------- */
  const inputBase =
    "w-full h-12 rounded-full border-2 px-5 text-[15px] placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-600";
  const inputOk = "border-gray-300";
  const inputErr = "border-red-500";
  const toggleBtn =
    "absolute right-3 top-1/2 -translate-y-1/2 h-7 px-2.5 rounded-full border text-[11px] font-semibold border-gray-300 text-gray-700 hover:bg-gray-50";

  /* --------------------- validation --------------------- */
  function validate(values = formData): FieldErrors {
    const e: FieldErrors = {};

    // email
    if (!values.email.trim()) e.email = "กรุณากรอกอีเมล";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      e.email = "รูปแบบอีเมลไม่ถูกต้อง";

    // phone (ตัวเลข 9–10 หลัก)
    if (!values.phone.trim()) e.phone = "กรุณากรอกเบอร์โทร";
    else if (!/^[0-9]{9,10}$/.test(values.phone))
      e.phone = "กรุณากรอกตัวเลข 9–10 หลัก";

    // name
    if (!values.first_name.trim()) e.first_name = "กรุณากรอกชื่อ";
    if (!values.last_name.trim()) e.last_name = "กรุณากรอกนามสกุล";

    // nationality & sex
    if (!values.nationality.trim()) e.nationality = "กรุณาระบุสัญชาติ";
    if (!values.sex.trim()) e.sex = "กรุณาเลือกเพศ";

    // password rules: >=8, มี a-z, A-Z, 0-9
    if (!values.password) e.password = "กรุณากรอกรหัสผ่าน";
    else if (values.password.length < 8) e.password = "อย่างน้อย 8 ตัวอักษร";
    else if (!/[a-z]/.test(values.password)) e.password = "ต้องมีตัวอักษรพิมพ์เล็ก (a-z)";
    else if (!/[A-Z]/.test(values.password)) e.password = "ต้องมีตัวอักษรพิมพ์ใหญ่ (A-Z)";
    else if (!/[0-9]/.test(values.password)) e.password = "ต้องมีตัวเลขอย่างน้อย 1 ตัว";

    if (!values.confirmPassword) e.confirmPassword = "กรุณายืนยันรหัสผ่าน";
    else if (values.confirmPassword !== values.password)
      e.confirmPassword = "รหัสผ่านไม่ตรงกัน";

    return e;
  }

  /* -------------------- handlers -------------------- */
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FieldErrors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
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
      const ok = await register({ email: formData.email, password: formData.password });
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

          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6 md:px-10 md:pt-8 space-y-6">
            {/* submit error */}
            {submitError ? (
              <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}

            {/* ผู้ใช้งาน */}
            <div>
              <p className="mb-2 text-sm font-extrabold text-blue-800">ข้อมูลผู้ใช้งาน</p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* email */}
                <div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ชื่อผู้ใช้งาน(อีเมล)"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.email ? inputErr : inputOk}`}
                  />
                  {errors.email ? (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  ) : null}
                </div>

                {/* phone */}
                <div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="เบอร์โทร"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.phone ? inputErr : inputOk}`}
                  />
                  {errors.phone ? (
                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                  ) : null}
                </div>

                {/* first name */}
                <div>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="ชื่อ"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.first_name ? inputErr : inputOk}`}
                  />
                  {errors.first_name ? (
                    <p className="mt-1 text-xs text-red-600">{errors.first_name}</p>
                  ) : null}
                </div>

                {/* last name */}
                <div>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="นามสกุล"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.last_name ? inputErr : inputOk}`}
                  />
                  {errors.last_name ? (
                    <p className="mt-1 text-xs text-red-600">{errors.last_name}</p>
                  ) : null}
                </div>

                {/* nationality */}
                <div>
                  <input
                    id="nationality"
                    name="nationality"
                    type="text"
                    placeholder="สัญชาติ"
                    value={formData.nationality}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.nationality ? inputErr : inputOk}`}
                  />
                  {errors.nationality ? (
                    <p className="mt-1 text-xs text-red-600">{errors.nationality}</p>
                  ) : null}
                </div>

                {/* sex */}
                <div>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.sex ? inputErr : inputOk} appearance-none pr-8`}
                  >
                    <option value="">เพศ</option>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                    <option value="ไม่ระบุ">ไม่ระบุ</option>
                  </select>
                  {errors.sex ? (
                    <p className="mt-1 text-xs text-red-600">{errors.sex}</p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* รหัสผ่าน */}
            <div>
              <p className="mb-2 text-sm font-extrabold text-blue-800">สร้างรหัสผ่าน</p>

              {/* password */}
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="รหัสผ่าน"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${inputBase} ${errors.password ? inputErr : inputOk} pr-24`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
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

              {/* confirm */}
              <div className="relative mt-4">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="ยืนยันรหัสผ่าน"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${inputBase} ${errors.confirmPassword ? inputErr : inputOk} pr-24`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className={toggleBtn}
                >
                  {showConfirm ? "ซ่อน" : "แสดง"}
                </button>

                {errors.confirmPassword ? (
                  <p className="mt-2 text-xs text-red-600">{errors.confirmPassword}</p>
                ) : null}
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
                <Link href="/auth/login" className="font-semibold text-blue-700 hover:underline">
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
