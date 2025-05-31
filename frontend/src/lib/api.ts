import axios from "axios";
import {
  LoginRequest,
  LoginResponse,
  User,
  Seminar,
  SeminarCreateRequest,
  FileAttachment,
} from "@/types";

const api = axios.create({
  baseURL: process.env.NODE_ENV === "production" ? "" : "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 인증 API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/api/auth/logout");
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },
};

// 세미나 API
export const seminarAPI = {
  getAllSeminars: async (): Promise<Seminar[]> => {
    const response = await api.get("/api/seminars");
    return response.data;
  },

  getSeminar: async (id: string): Promise<Seminar> => {
    const response = await api.get(`/api/seminars/${id}`);
    return response.data;
  },

  createSeminar: async (seminar: SeminarCreateRequest): Promise<Seminar> => {
    const response = await api.post("/api/seminars", seminar);
    return response.data;
  },

  updateSeminar: async (
    id: string,
    seminar: SeminarCreateRequest
  ): Promise<Seminar> => {
    const response = await api.put(`/api/seminars/${id}`, seminar);
    return response.data;
  },

  deleteSeminar: async (id: string): Promise<void> => {
    await api.delete(`/api/seminars/${id}`);
  },

  getSeminarApplicants: async (id: string): Promise<User[]> => {
    const response = await api.get(`/api/seminars/${id}/applicants`);
    return response.data;
  },

  closeSeminar: async (id: string): Promise<Seminar> => {
    const response = await api.put(`/api/seminars/${id}/close`);
    return response.data;
  },

  reopenSeminar: async (id: string): Promise<Seminar> => {
    const response = await api.put(`/api/seminars/${id}/reopen`);
    return response.data;
  },
};

// 신청 API
export const applicationAPI = {
  applySeminar: async (seminarId: string) => {
    const response = await api.post("/api/applications", { seminarId });
    return response.data;
  },

  getMyApplications: async () => {
    const response = await api.get("/api/applications/my");
    return response.data;
  },

  cancelApplication: async (applicationId: string) => {
    const response = await api.delete(
      `/api/applications/${applicationId}/cancel`
    );
    return response.data;
  },
};

// 파일 첨부 API
export const fileAPI = {
  uploadFiles: async (
    seminarId: string,
    files: FileList
  ): Promise<FileAttachment[]> => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post(
      `/api/seminars/${seminarId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  getSeminarAttachments: async (
    seminarId: string
  ): Promise<FileAttachment[]> => {
    const response = await api.get(`/api/seminars/${seminarId}/attachments`);
    return response.data;
  },

  deleteFile: async (fileId: string) => {
    const response = await api.delete(`/api/attachments/${fileId}`);
    return response.data;
  },

  downloadFile: (fileId: string) => {
    window.open(`/api/attachments/${fileId}/download`, "_blank");
  },
};

export default api;
