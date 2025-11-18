import axios, { AxiosInstance } from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, Book, CreateBookRequest, UpdateBookRequest, UpdateProfileRequest, ChangePasswordRequest, DeleteAccountRequest, GraphQLBook } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || `${API_BASE_URL}/graphql`;

const setupInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
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
};

const createClient = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  setupInterceptors(instance);
  return instance;
};

const api = createClient(API_BASE_URL);
const graphqlApi = createClient(GRAPHQL_URL);

type GraphQLResponse<T> = {
  data: T;
  errors?: { message: string }[];
};

const BOOK_FIELDS = `
  id
  title
  author
  year
  rating
  review
  coverImageUrl
  userId
`;

const graphqlRequest = async <T>(query: string, variables?: Record<string, unknown>): Promise<T> => {
  const response = await graphqlApi.post<GraphQLResponse<T>>('', {
    query,
    variables,
  });

  if (response.data.errors?.length) {
    throw new Error(response.data.errors[0].message);
  }

  return response.data.data;
};

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

export const graphqlBookService = {
  async getBooks(): Promise<GraphQLBook[]> {
    const query = `
      query MyBooks {
        myBooks {
          ${BOOK_FIELDS}
        }
      }
    `;

    const data = await graphqlRequest<{ myBooks: GraphQLBook[] }>(query);
    return data.myBooks;
  },

  async createBook(input: CreateBookRequest): Promise<GraphQLBook> {
    const mutation = `
      mutation CreateBook($input: CreateBookInput!) {
        createBook(input: $input) {
          ${BOOK_FIELDS}
        }
      }
    `;

    const data = await graphqlRequest<{ createBook: GraphQLBook }>(mutation, { input });
    return data.createBook;
  },

  async updateBook(id: string, input: UpdateBookRequest): Promise<GraphQLBook> {
    const mutation = `
      mutation UpdateBook($id: String!, $input: UpdateBookInput!) {
        updateBook(id: $id, input: $input) {
          ${BOOK_FIELDS}
        }
      }
    `;

    const data = await graphqlRequest<{ updateBook: GraphQLBook }>(mutation, { id, input });
    return data.updateBook;
  },

  async deleteBook(id: string): Promise<boolean> {
    const mutation = `
      mutation DeleteBook($id: String!) {
        deleteBook(id: $id)
      }
    `;

    const data = await graphqlRequest<{ deleteBook: boolean }>(mutation, { id });
    return data.deleteBook;
  },
};

export default api;
