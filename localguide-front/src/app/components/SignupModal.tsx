"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "../context/LocaleContext";

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

  const { language } = useLocale();
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    console.log("Signup attempt with:", { name, email, password });
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
              className="w-full py-3 px-4 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              {language === "th" ? "ลงทะเบียน" : "Sign up"}
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

            <div className="mt-6 space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 text-gray-700"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="#4285F4"
                  />
                </svg>
                {language === "th"
                  ? "ลงทะเบียนด้วย Google"
                  : "Continue with Google"}
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 text-gray-700"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"></path>
                </svg>
                {language === "th"
                  ? "ลงทะเบียนด้วย Facebook"
                  : "Continue with Facebook"}
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 text-gray-700"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.5,9.5C17.5,5.358,14.142,2,10,2S2.5,5.358,2.5,9.5c0,3.866,2.93,7.046,6.683,7.456C9.331,16.973,9.499,17,9.669,17h0.662 c0.17,0,0.338-0.027,0.485-0.044C14.57,16.546,17.5,13.366,17.5,9.5z M9.997,13.5c-0.827,0-1.5-0.673-1.5-1.5s0.673-1.5,1.5-1.5 s1.5,0.673,1.5,1.5S10.824,13.5,9.997,13.5z M12.997,8.5c-0.827,0-1.5-0.673-1.5-1.5s0.673-1.5,1.5-1.5s1.5,0.673,1.5,1.5 S13.824,8.5,12.997,8.5z M6.997,8.5c-0.827,0-1.5-0.673-1.5-1.5s0.673-1.5,1.5-1.5s1.5,0.673,1.5,1.5S7.824,8.5,6.997,8.5z"></path>
                </svg>
                {language === "th"
                  ? "ลงทะเบียนด้วย Apple"
                  : "Continue with Apple"}
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 text-gray-700"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
                {language === "th"
                  ? "ลงทะเบียนด้วยอีเมล"
                  : "Continue with email"}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
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
  );
}
