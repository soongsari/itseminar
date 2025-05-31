export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  department: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  iconName: string;
  colorCode: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  seminarCount?: number;
}

export interface Seminar {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  isClosed: boolean;
  createdBy: User;
  createdAt: string;
  attachments?: FileAttachment[];
  applicationCount: number;
  isUserApplied: boolean;
  canCancel: boolean;
  category?: Category;
}

export interface SeminarCreateRequest {
  title: string;
  description: string;
  date: string;
  location: string;
  categoryId?: string;
}

export interface FileAttachment {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface SeminarApplication {
  id: string;
  user: User;
  seminar: Seminar;
  appliedAt: string;
  canCancel: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}
