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

  const getNavLinks = () => {
    const baseLinks = [
      { href: "/", label: "หน้าหลัก" },
      { href: "/guides", label: "ค้นหาไกด์" },
      { href: "/trip-requires", label: "หาไกด์ท้องถิ่น" },
    ];

    if (!isLoggedIn) return baseLinks;

    const userLinks = [
      ...baseLinks,
      { href: "/my-trip-requires", label: "โพสต์ของฉัน" },
      { href: "/my-bookings", label: "การจองของฉัน" },
      { href: "/profile", label: "โปรไฟล์" },
    ];

    // Role 2 = Guide
    if (user?.role === 2) {
      userLinks.push({ href: "/guide-dashboard", label: "แดชบอร์ดไกด์" });
    }

    // Role 3 = Admin
    if (user?.role === 3) {
      userLinks.push(
        { href: "/admin/guides", label: "จัดการไกด์" },
        { href: "/admin/verifications", label: "อนุมัติไกด์" }
      );
    }

    return userLinks;
  };

  const navLinks = getNavLinks();

  const NavLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
        pathname === href
          ? "text-amber-600 border-amber-600"
          : "text-gray-700 hover:text-amber-600 border-transparent"
      }`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/globe.svg"
                alt="Local Guide"
                width={32}
                height={32}
              />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Local Guide
              </span>
            </Link>
            <div className="hidden sm:flex sm:ml-6 sm:space-x-4">
              {navLinks.map((link) => (
                <NavLink key={link.href} href={link.href}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
          {/* Desktop Auth */}
          <div className="hidden sm:flex sm:items-center space-x-4">
            {isLoggedIn ? (
              <>
                <span className="text-sm text-gray-700">
                  สวัสดี, {user?.firstName || "ผู้ใช้"}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-700"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-700"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/auth/register"
                  className="px-2 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 border border-amber-600 rounded-md bg-white flex items-center"
                >
                  ลงทะเบียน
                </Link>
              </>
            )}
          </div>
          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                // Close icon
                <svg
                  className="h-6 w-6"
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
              ) : (
                // Hamburger icon
                <svg
                  className="h-6 w-6"
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
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-gray-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isLoggedIn ? (
              <div className="space-y-1">
                <span className="block px-3 py-2 text-base font-medium text-gray-700">
                  สวัสดี, {user?.firstName || "ผู้ใช้"}
                </span>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-amber-600 hover:text-amber-700 hover:bg-gray-50"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-gray-50"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 text-base font-medium text-amber-600 hover:text-amber-700 hover:bg-gray-50"
                >
                  ลงทะเบียน
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
