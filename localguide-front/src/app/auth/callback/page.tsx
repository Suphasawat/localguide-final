"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      fetch("http://localhost:8080/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((user) => {
          localStorage.setItem("user", JSON.stringify(user));
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
