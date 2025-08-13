"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold">
            LocalGuide
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="hover:text-blue-200">
                  Dashboard
                </Link>

                {user?.role?.name === "guide" ? (
                  <>
                    <Link
                      href="/guide/trip-requires"
                      className="hover:text-blue-200"
                    >
                      Browse Trips
                    </Link>
                    <Link href="/guide/offers" className="hover:text-blue-200">
                      My Offers
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/user/trip-requires"
                      className="hover:text-blue-200"
                    >
                      My Trips
                    </Link>
                    <Link
                      href="/user/trip-requires/create"
                      className="hover:text-blue-200"
                    >
                      Post Trip
                    </Link>
                  </>
                )}

                <Link href="/bookings" className="hover:text-blue-200">
                  Bookings
                </Link>

                <div className="flex items-center space-x-2">
                  <span className="text-sm">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hover:text-blue-200">
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
