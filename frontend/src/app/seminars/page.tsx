"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { seminarAPI, authAPI } from "@/lib/api";
import { Seminar, User } from "@/types";

export default function SeminarsPage() {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 현재 사용자 정보 가져오기
        const currentUser = await authAPI.getCurrentUser();
        setUser(currentUser);

        // 세미나 목록 가져오기
        const seminarList = await seminarAPI.getAllSeminars();
        setSeminars(seminarList);
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push("/login");
        } else {
          setError("데이터를 불러오는데 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      router.push("/login");
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">IT 세미나</h1>
              {user && (
                <p className="text-sm text-gray-600">
                  {user.fullName}님 ({user.department}) -{" "}
                  {user.role === "ADMIN" ? "관리자" : "사용자"}
                </p>
              )}
            </div>
            <div className="flex space-x-4">
              {user?.role === "ADMIN" && (
                <button
                  onClick={() => router.push("/seminars/create")}
                  className="btn-primary"
                >
                  세미나 등록
                </button>
              )}
              <button onClick={handleLogout} className="btn-secondary">
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {seminars.map((seminar) => (
              <div
                key={seminar.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {seminar.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {seminar.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div>📅 {formatDate(seminar.date)}</div>
                    <div>📍 {seminar.location}</div>
                    <div>👥 신청자: {seminar.applicationCount}명</div>
                    <div>👤 주최자: {seminar.createdBy.fullName}</div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex space-x-2">
                      {seminar.isClosed && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          마감
                        </span>
                      )}
                      {seminar.isUserApplied && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          신청완료
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => router.push(`/seminars/${seminar.id}`)}
                      className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                    >
                      자세히 보기 →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {seminars.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">등록된 세미나가 없습니다.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
