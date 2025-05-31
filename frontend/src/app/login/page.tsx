"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authAPI.login(credentials);
      router.push("/seminars");
    } catch (err: any) {
      setError(err.response?.data?.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg px-4 sm:px-6 lg:px-8">
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full mix-blend-multiply animate-pulse-soft"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full mix-blend-multiply animate-pulse-soft"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-40 left-1/2 w-60 h-60 bg-white opacity-5 rounded-full mix-blend-multiply animate-pulse-soft"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* 로고 및 헤더 */}
        <div className="text-center animate-fade-in">
          <div className="mx-auto h-16 w-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-indigo-600"
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
          <h2 className="text-4xl font-bold text-white mb-2">IT 세미나</h2>
          <p className="text-xl text-indigo-100 mb-8">지식 공유의 시작</p>
        </div>

        {/* 로그인 폼 */}
        <div className="card animate-slide-in-right glass backdrop-blur-xl">
          <div className="card-content">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                환영합니다! 👋
              </h3>
              <p className="text-gray-600">
                계정에 로그인하여 세미나를 시작하세요
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-400 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  사용자명
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
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
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={credentials.username}
                    onChange={handleInputChange}
                    className="input-with-icon"
                    placeholder="사용자명을 입력하세요"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  비밀번호
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={credentials.password}
                    onChange={handleInputChange}
                    className="input-with-icon"
                    placeholder="비밀번호를 입력하세요"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-base font-semibold"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    로그인 중...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>로그인</span>
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                )}
              </button>
            </form>

            {/* 테스트 계정 안내 */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                💡 테스트 계정 정보
              </h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>
                  <strong>관리자:</strong> admin / admin123
                </p>
                <p>
                  <strong>사용자:</strong> user / user123
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="text-center animate-fade-in">
          <p className="text-indigo-100 text-sm">
            © 2025 IT 세미나 플랫폼. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
