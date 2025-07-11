"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // เก็บ token และ redirect
      localStorage.setItem("token", token);
      router.push("/");
      router.refresh();
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
