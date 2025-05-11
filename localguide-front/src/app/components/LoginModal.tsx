"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "../context/LocaleContext";
import { login } from "../services/auth.service";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupClick: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSignupClick,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLocale();
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
      onClose();
      router.refresh(); // Refresh to update navigation state
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
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

  const switchToSignup = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    onSignupClick();
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
            {language === "th" ? "เข้าสู่ระบบ" : "Log in"}
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading
                ? language === "th"
                  ? "กำลังเข้าสู่ระบบ..."
                  : "Logging in..."
                : language === "th"
                ? "เข้าสู่ระบบ"
                : "Log in"}
            </button>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  {language === "th" ? "จดจำฉัน" : "Remember me"}
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-rose-600 hover:text-rose-500"
                >
                  {language === "th" ? "ลืมรหัสผ่าน?" : "Forgot password?"}
                </a>
              </div>
            </div>
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
              <p className="mt-2 text-center text-sm text-gray-600">
                {language === "th"
                  ? "ยังไม่มีบัญชี?"
                  : "Don't have an account?"}{" "}
                <button
                  onClick={switchToSignup}
                  className="font-medium text-rose-600 hover:text-rose-500"
                >
                  {language === "th" ? "ลงทะเบียน" : "Sign up"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
