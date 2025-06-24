"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { isAuthenticated, logout, getUser } from "../services/auth.service";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLoggedIn = isAuthenticated();
  const user = getUser();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const NavLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`${
          isActive
            ? "text-rose-600 border-rose-600"
            : "text-gray-700 hover:text-rose-600 border-transparent"
        } px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-200`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                src="/globe.svg"
                alt="Local Guide"
                width={32}
                height={32}
                className="text-rose-600"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Local Guide
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <NavLink href="/">หน้าหลัก</NavLink>
              <NavLink href="/guides">ค้นหาไกด์</NavLink>
              {isLoggedIn && <NavLink href="/profile">โปรไฟล์</NavLink>}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {isLoggedIn ? (
              <>
                <span className="text-sm text-gray-700">
                  สวัสดี, {user?.firstName || "ผู้ใช้"}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-rose-600 hover:text-rose-700"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-rose-600 hover:text-rose-700"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700"
                >
                  ลงทะเบียน
                </Link>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">เปิดเมนู</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? "block" : "hidden"} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-gray-50"
          >
            หน้าหลัก
          </Link>
          <Link
            href="/guides"
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-gray-50"
          >
            ค้นหาไกด์
          </Link>
          {isLoggedIn && (
            <Link
              href="/profile"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-gray-50"
            >
              โปรไฟล์
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          {isLoggedIn ? (
            <div className="space-y-1">
              <span className="block px-3 py-2 text-base font-medium text-gray-700">
                สวัสดี, {user?.firstName || "ผู้ใช้"}
              </span>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-base font-medium text-rose-600 hover:text-rose-700 hover:bg-gray-50"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <Link
                href="/auth/login"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-gray-50"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/auth/register"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-gray-50"
              >
                ลงทะเบียน
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
