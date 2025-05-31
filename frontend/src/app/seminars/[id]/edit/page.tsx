"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { seminarAPI, authAPI, fileAPI } from "@/lib/api";
import {
  Seminar,
  User,
  SeminarCreateRequest,
  FileAttachment,
  Category,
} from "@/types";

export default function EditSeminarPage() {
  const [seminar, setSeminar] = useState<Seminar | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [existingFiles, setExistingFiles] = useState<FileAttachment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const params = useParams();
  const seminarId = params.id as string;

  const [formData, setFormData] = useState<SeminarCreateRequest>({
    title: "",
    description: "",
    date: "",
    location: "",
    categoryId: "",
  });

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

        // 세미나 정보와 카테고리 정보를 동시에 가져오기
        const [seminarDetail, categoryResponse] = await Promise.all([
          seminarAPI.getSeminar(seminarId),
          fetch("/api/categories", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        setSeminar(seminarDetail);

        const categoryData = await categoryResponse.json();
        setCategories(categoryData);

        // 기존 첨부파일 가져오기
        if (seminarDetail.attachments) {
          setExistingFiles(seminarDetail.attachments);
        }

        // 폼 데이터 설정 (날짜 형식 변환)
        const dateForInput = new Date(seminarDetail.date)
          .toISOString()
          .slice(0, 16); // YYYY-MM-DDTHH:mm 형식

        setFormData({
          title: seminarDetail.title,
          description: seminarDetail.description,
          date: dateForInput,
          location: seminarDetail.location,
          categoryId: seminarDetail.category?.id || "",
        });
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push("/login");
        } else if (err.response?.status === 403) {
          setError("관리자만 접근할 수 있습니다.");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // 날짜 형식을 LocalDateTime 형식으로 변환
      const localDateTime = formData.date + ":00"; // 초 추가

      await seminarAPI.updateSeminar(seminarId, {
        ...formData,
        date: localDateTime,
        categoryId: formData.categoryId || undefined,
      });

      // 새 파일이 있으면 업로드
      if (selectedFiles && selectedFiles.length > 0) {
        try {
          await fileAPI.uploadFiles(seminarId, selectedFiles);
        } catch (fileError) {
          console.error("파일 업로드 실패:", fileError);
          alert("세미나는 수정되었지만 일부 파일 업로드에 실패했습니다.");
        }
      }

      router.push(`/seminars/${seminarId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "세미나 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const removeSelectedFile = (index: number) => {
    if (!selectedFiles) return;

    const dt = new DataTransfer();
    Array.from(selectedFiles).forEach((file, i) => {
      if (i !== index) {
        dt.items.add(file);
      }
    });
    setSelectedFiles(dt.files);
  };

  const deleteExistingFile = async (fileId: string) => {
    if (!window.confirm("이 파일을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await fileAPI.deleteFile(fileId);
      setExistingFiles(existingFiles.filter((file) => file.id !== fileId));
    } catch (err: any) {
      alert(err.response?.data?.message || "파일 삭제에 실패했습니다.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
                onClick={() => router.push(`/seminars/${seminarId}`)}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium mb-2"
              >
                ← 세미나 상세로 돌아가기
              </button>
              <h1 className="text-3xl font-bold text-gray-900">세미나 수정</h1>
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
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* 기존 세미나 정보 */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">기존 정보</h2>
            <div className="mt-2 text-sm text-gray-600">
              <p>📅 {formatDate(seminar.date)}</p>
              <p>📍 {seminar.location}</p>
              <p>👤 주최자: {seminar.createdBy.fullName}</p>
              <p>👥 신청자: {seminar.applicationCount}명</p>
            </div>
          </div>

          {/* 수정 폼 */}
          <div className="px-6 py-8">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  세미나 제목 *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="세미나 제목을 입력하세요"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  세미나 설명
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="세미나에 대한 상세 설명을 입력하세요"
                />
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  세미나 일시 *
                </label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  장소 *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="세미나 장소를 입력하세요"
                />
              </div>

              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  카테고리 *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">카테고리를 선택하세요</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {seminar?.category && (
                  <p className="text-sm text-gray-600 mt-1">
                    현재 카테고리:{" "}
                    <span
                      className="font-medium"
                      style={{ color: seminar.category.colorCode }}
                    >
                      {seminar.category.name}
                    </span>
                  </p>
                )}
              </div>

              {/* 기존 첨부파일 */}
              {existingFiles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기존 첨부파일
                  </label>
                  <div className="space-y-2">
                    {existingFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {file.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.fileSize)} • 업로드:{" "}
                            {formatDate(file.uploadedAt)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => fileAPI.downloadFile(file.id)}
                            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                          >
                            다운로드
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteExistingFile(file.id)}
                            className="text-red-600 hover:text-red-500 text-sm font-medium"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 새 파일 업로드 */}
              <div>
                <label
                  htmlFor="files"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  새 첨부파일 추가
                </label>
                <input
                  type="file"
                  id="files"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, Office 문서, 텍스트, 압축파일 등을 업로드할 수 있습니다.
                </p>

                {/* 선택된 새 파일 목록 */}
                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      추가할 파일 ({selectedFiles.length}개)
                    </h4>
                    <div className="space-y-2">
                      {Array.from(selectedFiles).map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-blue-50 rounded-md"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(index)}
                            className="ml-2 text-red-600 hover:text-red-500 text-sm"
                          >
                            제거
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => router.push(`/seminars/${seminarId}`)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors"
                >
                  {submitting ? "수정 중..." : "세미나 수정"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
