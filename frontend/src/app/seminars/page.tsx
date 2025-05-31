"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { seminarAPI, authAPI } from "@/lib/api";
import { Seminar, User, Category } from "@/types";

export default function SeminarsPage() {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [allSeminars, setAllSeminars] = useState<Seminar[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"ongoing" | "ended">("ongoing");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [currentUser, seminarData, categoryData] = await Promise.all([
          authAPI.getCurrentUser(),
          seminarAPI.getAllSeminars(),
          fetch("/api/categories", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }).then((res) => res.json()),
        ]);
        setUser(currentUser);
        setSeminars(seminarData);
        setAllSeminars(seminarData);
        setCategories(categoryData);
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

  // 세미나 필터링 함수 (진행 중 / 종료됨)
  const getFilteredSeminars = () => {
    const now = new Date();
    let baseSeminars = allSeminars;

    // 탭에 따른 기본 필터링
    if (activeTab === "ongoing") {
      // 진행 중인 세미나: 날짜가 아직 안 지난 것들만
      baseSeminars = allSeminars.filter(
        (seminar) => new Date(seminar.date) >= now
      );
    } else {
      // 종료된 세미나: 날짜가 지난 것들 (마감 여부와 상관없이)
      baseSeminars = allSeminars.filter(
        (seminar) => new Date(seminar.date) < now
      );
    }

    // 키워드 검색
    if (searchKeyword.trim()) {
      baseSeminars = baseSeminars.filter(
        (seminar) =>
          seminar.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          seminar.description
            .toLowerCase()
            .includes(searchKeyword.toLowerCase())
      );
    }

    // 카테고리 필터
    if (selectedCategory) {
      baseSeminars = baseSeminars.filter(
        (seminar) => seminar.category?.id === selectedCategory
      );
    }

    return baseSeminars;
  };

  // 검색 및 필터링 적용
  useEffect(() => {
    setSeminars(getFilteredSeminars());
  }, [searchKeyword, selectedCategory, allSeminars, activeTab]);

  const clearFilters = () => {
    setSearchKeyword("");
    setSelectedCategory("");
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
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 spinner mx-auto mb-4"></div>
          <p className="text-white text-lg">세미나 목록을 불러오는 중...</p>
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">IT 세미나</h1>
                {user && (
                  <p className="text-indigo-100 text-sm">
                    안녕하세요, {user.fullName}님! ({user.department}){" "}
                    {user.role === "ADMIN" ? "👑" : "👤"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user?.role === "ADMIN" && (
                <>
                  <button
                    onClick={() => router.push("/admin/dashboard")}
                    className="btn-primary glass text-white border-white/30 hover:bg-white/10"
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    대시보드
                  </button>
                  <button
                    onClick={() => router.push("/seminars/create")}
                    className="btn-success"
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    새 세미나
                  </button>
                </>
              )}
              <button
                onClick={() => router.push("/my-applications")}
                className="btn-primary glass text-white border-white/30 hover:bg-white/10"
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
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2"
                  />
                </svg>
                내 신청 내역
              </button>
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
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-1">
            <button
              onClick={() => setActiveTab("ongoing")}
              className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                activeTab === "ongoing"
                  ? "bg-white text-gray-900 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>진행 중인 세미나</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === "ongoing"
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-white/20 text-white"
                }`}
              >
                {
                  allSeminars.filter((s) => new Date(s.date) >= new Date())
                    .length
                }
              </span>
            </button>
            <button
              onClick={() => setActiveTab("ended")}
              className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                activeTab === "ended"
                  ? "bg-white text-gray-900 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <svg
                className="w-4 h-4"
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
              <span>종료된 세미나</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === "ended"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-white/20 text-white"
                }`}
              >
                {
                  allSeminars.filter((s) => new Date(s.date) < new Date())
                    .length
                }
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 섹션을 좌측 사이드바로 변경 */}
      <div className="pt-8">
        {/* 좌측 검색/필터 사이드바 - 고정된 너비로 변경 */}
        <div className="hidden lg:block fixed left-0 top-32 w-80 h-[calc(100vh-8rem)] overflow-y-auto px-4 sm:px-6 lg:pl-8 lg:pr-4 z-40">
          <div className="card glass border-white/20 sticky top-0">
            <div className="card-content p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                검색 & 필터
              </h3>

              <div className="space-y-6">
                {/* 카테고리 필터 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-white">
                      카테고리
                    </label>
                    {selectedCategory && (
                      <button
                        onClick={() => setSelectedCategory("")}
                        className="text-xs text-indigo-300 hover:text-white transition-colors"
                      >
                        전체
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-gray-800 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all duration-200"
                  >
                    <option value="">🏷️ 전체 카테고리</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 키워드 검색 */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    키워드 검색
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      placeholder="제목, 내용 검색..."
                      className="w-full pl-10 pr-10 py-2 text-sm text-gray-800 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all duration-200"
                    />
                    {searchKeyword && (
                      <button
                        onClick={() => setSearchKeyword("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* 필터 초기화 버튼 */}
                {(searchKeyword || selectedCategory) && (
                  <button
                    onClick={clearFilters}
                    className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500/80 to-pink-500/80 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg hover:from-red-600/90 hover:to-pink-600/90 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-500/30"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    초기화
                  </button>
                )}

                {/* 검색 결과 정보 */}
                <div className="pt-4 border-t border-white/10">
                  <div className="space-y-2 text-sm">
                    <div className="font-medium text-white/90 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm text-center">
                      총{" "}
                      <span className="text-white font-bold">
                        {seminars.length}
                      </span>
                      개의 세미나
                    </div>

                    {searchKeyword && (
                      <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                        <div className="flex items-center text-indigo-200 text-xs">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          '
                          <span className="text-white font-medium">
                            {searchKeyword}
                          </span>
                          ' 검색
                        </div>
                      </div>
                    )}

                    {selectedCategory && (
                      <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                        <div className="flex items-center text-emerald-200 text-xs">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                          {
                            categories.find((c) => c.id === selectedCategory)
                              ?.name
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 - 고정된 마진으로 사이드바 공간 확보 */}
        <div className="lg:ml-80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {error && (
              <div className="mb-8 card bg-red-50 border-red-200">
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
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                {activeTab === "ongoing"
                  ? "🎯 진행 중인 세미나"
                  : "📋 종료된 세미나"}
              </h2>
              <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                {activeTab === "ongoing"
                  ? "최신 IT 트렌드와 기술을 공유하는 세미나에 참여하세요"
                  : "지난 세미나들을 둘러보고 놓친 내용을 확인해보세요"}
              </p>
            </div>

            {/* 세미나 목록 */}
            {seminars.length === 0 ? (
              <div className="text-center py-16">
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
                      d={
                        activeTab === "ongoing"
                          ? "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      }
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {activeTab === "ongoing"
                    ? "진행 중인 세미나가 없습니다"
                    : "종료된 세미나가 없습니다"}
                </h3>
                <p className="text-indigo-100 mb-8">
                  {activeTab === "ongoing"
                    ? "새로운 세미나가 등록되면 여기에 표시됩니다"
                    : "아직 종료된 세미나가 없습니다"}
                </p>
                {user?.role === "ADMIN" && activeTab === "ongoing" && (
                  <button
                    onClick={() => router.push("/seminars/create")}
                    className="btn-primary"
                  >
                    첫 번째 세미나 등록하기
                  </button>
                )}
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-full max-w-5xl">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {seminars.map((seminar) => (
                      <div
                        key={seminar.id}
                        className="card group cursor-pointer hover:shadow-lg transition-shadow duration-200"
                        onClick={() => router.push(`/seminars/${seminar.id}`)}
                      >
                        {/* 카드 헤더 */}
                        <div className="card-header p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2 flex-1 pr-4">
                                  {seminar.title}
                                </h3>
                                {seminar.category && (
                                  <span
                                    className="inline-block px-3 py-1 rounded-full text-xs text-white font-medium ml-2 flex-shrink-0"
                                    style={{
                                      backgroundColor:
                                        seminar.category.colorCode,
                                    }}
                                  >
                                    {seminar.category.name}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600 flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                  {seminar.createdBy.fullName}
                                </p>
                                <div className="flex-shrink-0">
                                  {getStatusBadge(seminar)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 카드 콘텐츠 */}
                        <div className="card-content p-6">
                          <div className="space-y-4">
                            {/* 세미나 설명 */}
                            <div>
                              <p className="text-gray-700 text-sm line-clamp-3 leading-relaxed">
                                {seminar.description ||
                                  "세미나 설명이 없습니다."}
                              </p>
                            </div>

                            {/* 세미나 정보 그리드 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                              <div className="flex items-center text-sm text-gray-600">
                                <svg
                                  className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0"
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
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {formatDate(seminar.date)}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center text-sm text-gray-600">
                                <svg
                                  className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0"
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
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {seminar.location}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center text-sm text-gray-600">
                                <svg
                                  className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0"
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
                                <div>
                                  <div className="font-medium text-gray-900">
                                    신청자 {seminar.applicationCount}명
                                  </div>
                                </div>
                              </div>

                              {/* 첨부파일 표시 */}
                              {seminar.attachments &&
                                seminar.attachments.length > 0 && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <svg
                                      className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                      />
                                    </svg>
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        첨부파일 {seminar.attachments.length}개
                                      </div>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>

                        {/* 카드 푸터 */}
                        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 flex items-center">
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {new Date(seminar.createdAt).toLocaleDateString(
                                "ko-KR"
                              )}{" "}
                              등록
                            </span>
                            <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:text-indigo-700 transition-colors duration-200">
                              자세히 보기
                              <svg
                                className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
