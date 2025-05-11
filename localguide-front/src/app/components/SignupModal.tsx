"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "../context/LocaleContext";
import { register } from "../services/auth.service";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export default function SignupModal({
  isOpen,
  onClose,
  onLoginClick,
}: SignupModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { language } = useLocale();
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(
        language === "th" ? "รหัสผ่านไม่ตรงกัน" : "Passwords do not match"
      );
      return;
    }

    setIsLoading(true);

    try {
      await register({ email, password });
      onClose();
      router.refresh(); // Refresh to update navigation state
    } catch (err: any) {
      setError(
        err.message ||
          (language === "th" ? "การลงทะเบียนล้มเหลว" : "Registration failed")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const switchToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    onLoginClick();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden"
      >
        {/* Header with close button */}
        <div className="relative p-4 border-b">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2 className="text-center text-xl font-semibold text-gray-900">
            {language === "th" ? "ลงทะเบียน" : "Sign up"}
          </h2>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-center mb-6">
            {language === "th"
              ? "ยินดีต้อนรับสู่ Localguide"
              : "Welcome to Localguide"}
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder={language === "th" ? "ชื่อผู้ใช้" : "Full name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder={language === "th" ? "อีเมล" : "Email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder={language === "th" ? "รหัสผ่าน" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder={
                  language === "th" ? "ยืนยันรหัสผ่าน" : "Confirm password"
                }
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                  className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-600">
                  {language === "th" ? "ฉันยอมรับ" : "I agree to the"}{" "}
                  <a href="#" className="text-rose-600 hover:text-rose-500">
                    {language === "th"
                      ? "ข้อกำหนดและเงื่อนไข"
                      : "Terms and Conditions"}
                  </a>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading
                ? language === "th"
                  ? "กำลังลงทะเบียน..."
                  : "Signing up..."
                : language === "th"
                ? "ลงทะเบียน"
                : "Sign up"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {language === "th" ? "หรือ" : "or"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-center text-sm text-gray-600">
                {language === "th"
                  ? "มีบัญชีอยู่แล้ว?"
                  : "Already have an account?"}{" "}
                <button
                  onClick={switchToLogin}
                  className="font-medium text-rose-600 hover:text-rose-500"
                >
                  {language === "th" ? "เข้าสู่ระบบ" : "Log in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
