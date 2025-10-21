import axios from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, Book, CreateBookRequest, UpdateBookRequest, UpdateProfileRequest, ChangePasswordRequest, DeleteAccountRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirigir si NO estamos haciendo login/register y NO es un error de login/register
    const isLoginOrRegister = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
    const isOnLoginPage = window.location.pathname.includes('/login') || window.location.pathname === '/';
    
    if (error.response?.status === 401 && !isLoginOrRegister && !isOnLoginPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
};

export const bookService = {
  async getBooks(): Promise<Book[]> {
    const response = await api.get('/api/books');
    return response.data;
  },

  async getBook(id: number): Promise<Book> {
    const response = await api.get(`/api/books/${id}`);
    return response.data;
  },

  async createBook(bookData: CreateBookRequest): Promise<Book> {
    const response = await api.post('/api/books', bookData);
    return response.data;
  },

  async updateBook(id: number, bookData: UpdateBookRequest): Promise<Book> {
    const response = await api.put(`/api/books/${id}`, bookData);
    return response.data;
  },

  async deleteBook(id: number): Promise<void> {
    await api.delete(`/api/books/${id}`);
  },
};

export const accountService = {
  async updateProfile(profileData: UpdateProfileRequest): Promise<any> {
    const response = await api.put('/api/account/profile', profileData);
    return response.data;
  },

  async changePassword(passwordData: ChangePasswordRequest): Promise<any> {
    const response = await api.put('/api/account/password', passwordData);
    return response.data;
  },

  async deleteAccount(deleteData: DeleteAccountRequest): Promise<any> {
    const response = await api.delete('/api/account/account', { data: deleteData });
    return response.data;
  },
};

export default api;
