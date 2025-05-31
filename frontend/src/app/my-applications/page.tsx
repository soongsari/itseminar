"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { applicationAPI, authAPI } from "@/lib/api";
import { SeminarApplication, User } from "@/types";

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<SeminarApplication[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [currentUser, myApplications] = await Promise.all([
          authAPI.getCurrentUser(),
          applicationAPI.getMyApplications(),
        ]);
        setUser(currentUser);
        setApplications(myApplications);
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

  const handleCancelApplication = async (application: SeminarApplication) => {
    const confirmCancel = window.confirm(
      `정말로 "${application.seminar.title}" 세미나 신청을 취소하시겠습니까?`
    );

    if (!confirmCancel) return;

    setCancelLoading(application.id);
    try {
      await applicationAPI.cancelApplication(application.id);
      // 신청 내역 다시 불러오기
      const updatedApplications = await applicationAPI.getMyApplications();
      setApplications(updatedApplications);
      alert("세미나 신청이 취소되었습니다.");
    } catch (err: any) {
      alert(err.response?.data?.message || "세미나 신청 취소에 실패했습니다.");
    } finally {
      setCancelLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const getStatusBadge = (application: SeminarApplication) => {
    if (application.seminar.isClosed || isExpired(application.seminar.date)) {
      return <span className="badge-gray">종료됨</span>;
    }
    if (application.canCancel) {
      return <span className="badge-primary">취소가능</span>;
    }
    return <span className="badge-warning">취소불가</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 spinner mx-auto mb-4"></div>
          <p className="text-white text-lg">신청 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* 헤더 */}
      <header className="glass border-b border-white/20 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/seminars")}
                className="text-white hover:text-indigo-200 text-sm font-medium"
              >
                ← 세미나 목록으로 돌아가기
              </button>
              <div className="h-10 w-10 bg-white rounded-xl shadow-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">내 신청 내역</h1>
                {user && (
                  <p className="text-indigo-100 text-sm">
                    {user.fullName}님의 세미나 신청 현황
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-secondary glass text-white border-white/30 hover:bg-white/10"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-8 card bg-red-50 border-red-200 animate-fade-in">
            <div className="card-content">
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-red-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 페이지 타이틀 */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold text-white mb-4">
            📋 내 신청 내역
          </h2>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            신청한 세미나를 확인하고 관리하세요
          </p>
        </div>

        {/* 신청 내역 목록 */}
        {applications.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-white/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              신청한 세미나가 없습니다
            </h3>
            <p className="text-indigo-100 mb-8">
              관심있는 세미나에 신청해보세요
            </p>
            <button
              onClick={() => router.push("/seminars")}
              className="btn-primary"
            >
              세미나 둘러보기
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application, index) => (
              <div
                key={application.id}
                className="card group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* 카드 헤더 */}
                <div className="card-header">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {application.seminar.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        👤 {application.seminar.createdBy.fullName} (
                        {application.seminar.createdBy.department})
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {getStatusBadge(application)}
                    </div>
                  </div>
                </div>

                {/* 카드 콘텐츠 */}
                <div className="card-content">
                  <div className="space-y-4">
                    {/* 세미나 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          className="w-4 h-4 mr-2 text-indigo-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {formatDate(application.seminar.date)}
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          className="w-4 h-4 mr-2 text-indigo-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {application.seminar.location}
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        신청일: {formatDate(application.appliedAt)}
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          className="w-4 h-4 mr-2 text-indigo-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                        신청자 {application.seminar.applicationCount}명
                      </div>
                    </div>

                    {/* 세미나 설명 */}
                    {application.seminar.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {application.seminar.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* 카드 푸터 */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        router.push(`/seminars/${application.seminar.id}`)
                      }
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      세미나 상세보기 →
                    </button>

                    {application.canCancel && (
                      <button
                        onClick={() => handleCancelApplication(application)}
                        disabled={cancelLoading === application.id}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                      >
                        {cancelLoading === application.id
                          ? "취소 중..."
                          : "신청 취소"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
