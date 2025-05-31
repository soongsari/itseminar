"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 메인 페이지 접속 시 로그인 페이지로 리디렉션
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          IT 세미나 신청 시스템
        </h1>
        <p className="text-lg text-gray-600 mb-8">로그인 페이지로 이동 중...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    </div>
  );
}
