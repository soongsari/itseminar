"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { seminarAPI, authAPI } from "@/lib/api";
import { Seminar, User } from "@/types";

export default function SeminarApplicantsPage() {
  const [seminar, setSeminar] = useState<Seminar | null>(null);
  const [applicants, setApplicants] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();
  const seminarId = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 현재 사용자 정보 가져오기
        const currentUser = await authAPI.getCurrentUser();
        setUser(currentUser);

        // 관리자가 아니면 접근 거부
        if (currentUser.role !== "ADMIN") {
          setError("관리자만 접근할 수 있습니다.");
          return;
        }

        // 세미나 정보 가져오기
        const seminarDetail = await seminarAPI.getSeminar(seminarId);
        setSeminar(seminarDetail);

        // 신청자 목록 가져오기
        const applicantList = await seminarAPI.getSeminarApplicants(seminarId);
        setApplicants(applicantList);
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push("/login");
        } else if (err.response?.status === 403) {
          setError("관리자만 접근할 수 있습니다.");
        } else {
          setError("데이터를 불러오는데 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (seminarId) {
      fetchData();
    }
  }, [seminarId, router]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      router.push("/login");
    } catch (err) {
      console.error("로그아웃 실패:", err);
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

  const exportToCSV = () => {
    if (!applicants.length || !seminar) return;

    const csvHeader = "이름,부서,이메일,사용자명\n";
    const csvData = applicants
      .map(
        (applicant) =>
          `"${applicant.fullName}","${applicant.department}","${applicant.email}","${applicant.username}"`
      )
      .join("\n");

    const csvContent = csvHeader + csvData;
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${seminar.title}_신청자명단.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => router.push("/seminars")}
              className="mt-4 btn-primary"
            >
              세미나 목록으로 돌아가기
            </button>
          </div>
        </div>
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
              <button
                onClick={() => router.push(`/seminars/${seminarId}`)}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium mb-2"
              >
                ← 세미나 상세로 돌아가기
              </button>
              <h1 className="text-3xl font-bold text-gray-900">신청자 명단</h1>
              {user && (
                <p className="text-sm text-gray-600">
                  {user.fullName}님 ({user.department}) - 관리자
                </p>
              )}
            </div>
            <button onClick={handleLogout} className="btn-secondary">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {seminar && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* 세미나 정보 헤더 */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {seminar.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    📅 {formatDate(seminar.date)} · 📍 {seminar.location}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    총 신청자: {applicants.length}명
                  </span>
                  {applicants.length > 0 && (
                    <button
                      onClick={exportToCSV}
                      className="btn-secondary text-sm"
                    >
                      CSV 다운로드
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 신청자 목록 */}
            <div className="px-6 py-6">
              {applicants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          번호
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          이름
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          부서
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          이메일
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          사용자명
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applicants.map((applicant, index) => (
                        <tr key={applicant.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {applicant.fullName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {applicant.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {applicant.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {applicant.username}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    아직 신청자가 없습니다
                  </h3>
                  <p className="text-gray-500">
                    세미나에 신청한 사용자가 없습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
