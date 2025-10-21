export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  coverImageUrl?: string;
  rating: number;
  review?: string;
  userId: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  year: number;
  coverImageUrl?: string;
  rating: number;
  review?: string;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  year?: number;
  coverImageUrl?: string;
  rating?: number;
  review?: string;
}

// Nuevos tipos para gestión de cuenta
export interface UpdateProfileRequest {
  nombre: string;
  apellido: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
}