"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { seminarAPI, authAPI, applicationAPI, fileAPI } from "@/lib/api";
import { Seminar, User, SeminarApplication } from "@/types";

export default function SeminarDetailPage() {
  const [seminar, setSeminar] = useState<Seminar | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userApplication, setUserApplication] =
    useState<SeminarApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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

        // 세미나 상세 정보 가져오기
        const seminarDetail = await seminarAPI.getSeminar(seminarId);
        setSeminar(seminarDetail);

        // 사용자의 신청 내역 가져오기 (신청 취소용 applicationId 확인)
        if (seminarDetail.isUserApplied) {
          const myApplications = await applicationAPI.getMyApplications();
          const currentApplication = myApplications.find(
            (app: SeminarApplication) => app.seminar.id === seminarId
          );
          setUserApplication(currentApplication || null);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push("/login");
        } else {
          setError("세미나 정보를 불러오는데 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (seminarId) {
      fetchData();
    }
  }, [seminarId, router]);

  const handleApply = async () => {
    if (!seminar || actionLoading) return;

    setActionLoading(true);
    try {
      await applicationAPI.applySeminar(seminar.id);
      // 세미나 정보 다시 불러오기
      const updatedSeminar = await seminarAPI.getSeminar(seminar.id);
      setSeminar(updatedSeminar);

      // 신청 내역도 다시 가져오기
      if (updatedSeminar.isUserApplied) {
        const myApplications = await applicationAPI.getMyApplications();
        const currentApplication = myApplications.find(
          (app: SeminarApplication) => app.seminar.id === seminarId
        );
        setUserApplication(currentApplication || null);
      }

      alert("세미나 신청이 완료되었습니다!");
    } catch (err: any) {
      alert(err.response?.data?.message || "세미나 신청에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelApplication = async () => {
    if (!seminar || !userApplication || actionLoading) return;

    const confirmCancel = window.confirm(
      `정말로 "${seminar.title}" 세미나 신청을 취소하시겠습니까?`
    );

    if (!confirmCancel) return;

    setActionLoading(true);
    try {
      await applicationAPI.cancelApplication(userApplication.id);
      // 세미나 정보 다시 불러오기
      const updatedSeminar = await seminarAPI.getSeminar(seminar.id);
      setSeminar(updatedSeminar);
      setUserApplication(null);
      alert("세미나 신청이 취소되었습니다.");
    } catch (err: any) {
      alert(err.response?.data?.message || "세미나 신청 취소에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!seminar) return;

    const confirmDelete = window.confirm(
      `정말로 "${seminar.title}" 세미나를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 신청 정보도 함께 삭제됩니다.`
    );

    if (!confirmDelete) return;

    try {
      await seminarAPI.deleteSeminar(seminar.id);
      alert("세미나가 삭제되었습니다.");
      router.push("/seminars");
    } catch (err: any) {
      alert(err.response?.data?.message || "세미나 삭제에 실패했습니다.");
    }
  };

  const handleCloseSeminar = async () => {
    if (!seminar) return;

    const confirmClose = window.confirm(
      `정말로 "${seminar.title}" 세미나를 마감 처리하시겠습니까?\n\n마감 후에는 더 이상 신청을 받지 않습니다.`
    );

    if (!confirmClose) return;

    try {
      const updatedSeminar = await seminarAPI.closeSeminar(seminar.id);
      setSeminar(updatedSeminar);
      alert("세미나가 마감 처리되었습니다.");
    } catch (err: any) {
      alert(err.response?.data?.message || "세미나 마감 처리에 실패했습니다.");
    }
  };

  const handleReopenSeminar = async () => {
    if (!seminar) return;

    const confirmReopen = window.confirm(
      `정말로 "${seminar.title}" 세미나의 마감을 취소하시겠습니까?\n\n마감 취소 후에는 다시 신청을 받을 수 있습니다.`
    );

    if (!confirmReopen) return;

    try {
      const updatedSeminar = await seminarAPI.reopenSeminar(seminar.id);
      setSeminar(updatedSeminar);
      alert("세미나 마감이 취소되었습니다.");
    } catch (err: any) {
      alert(err.response?.data?.message || "세미나 마감 취소에 실패했습니다.");
    }
  };

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

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const getStatusBadge = (seminar: Seminar) => {
    const isExpiredSeminar = isExpired(seminar.date);

    // 세미나 날짜가 지난 경우 (마감 여부와 상관없이 우선순위)
    if (isExpiredSeminar) {
      return <span className="badge-gray">종료</span>;
    }

    // 관리자가 강제로 마감한 경우 (날짜가 안 지났을 때만)
    if (seminar.isClosed) {
      return <span className="badge-error">마감</span>;
    }

    // 진행 중인 세미나의 상태
    if (seminar.isUserApplied) {
      return <span className="badge-success">기신청</span>;
    }

    return <span className="badge-primary">신청가능</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !seminar) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-8 text-center">
            <p className="text-red-600">
              {error || "세미나를 찾을 수 없습니다."}
            </p>
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
                onClick={() => router.push("/seminars")}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium mb-2"
              >
                ← 세미나 목록으로 돌아가기
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                세미나 상세정보
              </h1>
              {user && (
                <p className="text-sm text-gray-600">
                  {user.fullName}님 ({user.department}) -{" "}
                  {user.role === "ADMIN" ? "관리자" : "사용자"}
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
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* 세미나 기본 정보 */}
          <div className="px-6 py-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 pr-4">
                    {seminar.title}
                  </h2>
                  {seminar.category && (
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs text-white font-medium flex-shrink-0"
                      style={{
                        backgroundColor: seminar.category.colorCode,
                      }}
                    >
                      {seminar.category.name}
                    </span>
                  )}
                </div>

                {/* 상태 배지 */}
                <div className="flex space-x-2 mb-4">
                  {isExpired(seminar.date) ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      종료
                    </span>
                  ) : seminar.isClosed ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      마감
                    </span>
                  ) : null}
                  {seminar.isUserApplied &&
                    !isExpired(seminar.date) &&
                    !seminar.isClosed && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        기신청
                      </span>
                    )}
                </div>
              </div>

              {/* 신청 버튼 */}
              {!seminar.isClosed && !isExpired(seminar.date) && (
                <div className="ml-6">
                  {!seminar.isUserApplied ? (
                    <button
                      onClick={handleApply}
                      disabled={actionLoading}
                      className="btn-primary disabled:bg-blue-400"
                    >
                      {actionLoading ? "신청 중..." : "세미나 신청"}
                    </button>
                  ) : (
                    <div className="text-center space-y-2">
                      {seminar.canCancel && userApplication?.canCancel && (
                        <button
                          onClick={handleCancelApplication}
                          disabled={actionLoading}
                          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                        >
                          {actionLoading ? "취소 중..." : "신청 취소"}
                        </button>
                      )}
                      {(!seminar.canCancel || !userApplication?.canCancel) && (
                        <p className="text-xs text-gray-500">
                          세미나 시작 24시간 전까지만 취소 가능
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 세미나 정보 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    일시
                  </h3>
                  <p className="text-lg text-gray-900">
                    {formatDate(seminar.date)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    장소
                  </h3>
                  <p className="text-lg text-gray-900">{seminar.location}</p>
                </div>

                {seminar.category && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      카테고리
                    </h3>
                    <div className="flex items-center">
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: seminar.category.colorCode,
                        }}
                      ></span>
                      <p className="text-lg text-gray-900">
                        {seminar.category.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    주최자
                  </h3>
                  <p className="text-lg text-gray-900">
                    {seminar.createdBy.fullName} ({seminar.createdBy.department}
                    )
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    신청자 수
                  </h3>
                  <p className="text-lg text-gray-900">
                    {seminar.applicationCount}명
                  </p>
                </div>
              </div>
            </div>

            {/* 세미나 설명 */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                세미나 소개
              </h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {seminar.description || "세미나 설명이 없습니다."}
                </p>
              </div>
            </div>

            {/* 첨부파일 */}
            {seminar.attachments && seminar.attachments.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  첨부파일
                </h3>
                <div className="space-y-2">
                  {seminar.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {attachment.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          업로드: {formatDate(attachment.uploadedAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => fileAPI.downloadFile(attachment.id)}
                        className="ml-4 text-blue-600 hover:text-blue-500 text-sm font-medium"
                      >
                        다운로드
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 관리자 액션 */}
          {user?.role === "ADMIN" && (
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => router.push(`/seminars/${seminar.id}/edit`)}
                  className="btn-secondary"
                >
                  수정
                </button>
                <button
                  onClick={() =>
                    router.push(`/seminars/${seminar.id}/applicants`)
                  }
                  className="btn-secondary"
                >
                  신청자 목록 ({seminar.applicationCount}명)
                </button>

                {/* 마감/마감취소 버튼 (세미나가 종료되지 않은 경우에만) */}
                {!isExpired(seminar.date) && (
                  <>
                    {seminar.isClosed ? (
                      <button
                        onClick={handleReopenSeminar}
                        className="py-2 px-4 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        마감 취소
                      </button>
                    ) : (
                      <button
                        onClick={handleCloseSeminar}
                        className="py-2 px-4 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                      >
                        마감 처리
                      </button>
                    )}
                  </>
                )}

                <button
                  onClick={handleDelete}
                  className="py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
