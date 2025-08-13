"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCookie } from "cookies-next";
import axios from "axios";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // เก็บ token ใน cookie
      setCookie("token", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      // ดึง user info
      axios
        .get("http://localhost:8080/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setCookie("user", JSON.stringify(res.data), {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
          });
          router.push("/profile");
        })
        .catch(() => {
          router.push("/auth/login?error=oauth_failed");
        });
    } else {
      router.push("/auth/login?error=oauth_failed");
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div>กำลังเข้าสู่ระบบ...</div>
    </div>
  );
}
