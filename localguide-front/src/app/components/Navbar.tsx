"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageCurrencyModal from "./LanguageCurrencyModal";
import AuthModal from "./AuthModal";
import { useLocale } from "../context/LocaleContext";
import { isAuthenticated, getUser, logout } from "../services/auth.service";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocaleModalOpen, setIsLocaleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<"login" | "signup">(
    "login"
  );
  const [user, setUser] = useState<any>(null);
  const [isAuth, setIsAuth] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language, currency } = useLocale();
  const router = useRouter();

  useEffect(() => {
    // Check authentication status on component mount and on client side
    if (typeof window !== "undefined") {
      setIsAuth(isAuthenticated());
      setUser(getUser());
    }
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const openLocaleModal = () => {
    setIsLocaleModalOpen(true);
  };

  const openLoginModal = () => {
    setAuthModalView("login");
    setIsAuthModalOpen(true);
    setIsOpen(false);
  };

  const openSignupModal = () => {
    setAuthModalView("signup");
    setIsAuthModalOpen(true);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsAuth(false);
    setIsOpen(false);
    router.refresh(); // Refresh the page to update UI
  };

  const handleNavigateToLogin = () => {
    router.push("/login");
    setIsOpen(false);
  };

  const handleNavigateToSignup = () => {
    router.push("/signup");
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="py-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center">
              <svg
                className="h-8 w-8 text-rose-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2V7h2v10z"></path>
              </svg>
              <span className="ml-2 text-xl font-bold text-rose-500">
                localguide
              </span>
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {/* Language and Currency Button */}
          <button
            onClick={openLocaleModal}
            className="flex items-center p-2 rounded-full hover:bg-gray-100"
          >
            <svg
              className="h-5 w-5 text-gray-800"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            <span className="ml-1">
              {language === "th" ? "TH" : "EN"} · {currency}
            </span>
          </button>

          <button className="px-4 py-2 rounded-full border border-gray-200 hover:shadow-md transition">
            ให้เช่าที่พัก
          </button>
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center space-x-2 p-2 rounded-full border border-gray-200 hover:shadow-md transition cursor-pointer"
              onClick={toggleDropdown}
            >
              <svg
                className="h-5 w-5 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <div className="h-8 w-8 bg-gray-500 rounded-full flex items-center justify-center text-white">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg overflow-hidden z-10 border border-gray-200">
                {isAuth && user ? (
                  // Logged in menu options
                  <>
                    <div className="py-2 border-b">
                      <div className="px-4 py-2 text-sm text-gray-500">
                        {user.email}
                      </div>
                      <Link
                        href="/profile"
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                      >
                        {language === "th" ? "โปรไฟล์" : "Profile"}
                      </Link>
                      <Link
                        href="/bookings"
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                      >
                        {language === "th" ? "การจองของฉัน" : "My bookings"}
                      </Link>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        {language === "th" ? "ออกจากระบบ" : "Log out"}
                      </button>
                    </div>
                  </>
                ) : (
                  // Not logged in menu options
                  <div className="py-2 border-b">
                    <button
                      onClick={handleNavigateToLogin}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      {language === "th" ? "เข้าสู่ระบบ" : "Log in"}
                    </button>
                    <button
                      onClick={handleNavigateToSignup}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      {language === "th" ? "ลงทะเบียน" : "Sign up"}
                    </button>
                  </div>
                )}
                <div className="py-2">
                  <Link
                    href="/host"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    {language === "th"
                      ? "ให้เช่าที่พักของคุณ"
                      : "Airbnb your home"}
                  </Link>
                  <Link
                    href="/host-experience"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    {language === "th" ? "จัดประสบการณ์" : "Host an experience"}
                  </Link>
                  <Link
                    href="/help"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    {language === "th" ? "ศูนย์ช่วยเหลือ" : "Help Center"}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Language/Currency Modal */}
      <LanguageCurrencyModal
        isOpen={isLocaleModalOpen}
        onClose={() => setIsLocaleModalOpen(false)}
      />

      {/* Auth Modal (Login/Signup) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialView={authModalView}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
