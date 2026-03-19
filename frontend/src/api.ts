import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const API: AxiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: AxiosResponse<any>) => void;
  reject: (error?: any) => void;
}[] = [];

// Process the queue of failed requests
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(API(prom as any));
  });
  failedQueue = [];
};

// Skip token refresh for auth and password reset endpoints
const skipAuthEndpoints = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/skills",
  "/categories",
];

// Request interceptor – attach token
API.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor – handle 401 + retry
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for the token refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => API(originalRequest))
          .catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await API.post("/refresh", null, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const newToken = response.data.token;
        localStorage.setItem("token", newToken);
        API.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return API(originalRequest);
      } catch (e) {
        processQueue(e, null);
        localStorage.removeItem("token");
        window.location.replace("/login");
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  },
);

// --- Types ---
export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  token: string;
  token_type?: string;
  expires_in?: number;
}
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
export interface ProfileData {
  email: string;
  created_at?: string;
}
export interface ProfileUpdateRequest {
  email: string;
  password?: string;
  password_confirmation?: string;
}
export interface APIMessageResponse {
  message: string;
}

export const login = (data: LoginRequest) =>
  API.post<LoginResponse>("/login", data);
export const register = (data: RegisterRequest) =>
  API.post<APIMessageResponse>("/register", data);
export const getProfile = () => API.get<ProfileData>("/profile");
export const updateProfile = (data: ProfileUpdateRequest) =>
  API.put<APIMessageResponse>("/profile", data);
export const deleteProfile = () => API.delete<APIMessageResponse>("/profile");
export const refreshToken = () => API.post<LoginResponse>("/refresh");

export default API;
