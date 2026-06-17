import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ProfileData,
  ProfileUpdateRequest,
  APIMessageResponse,
  FailedQueueItem,
} from "@/types";

// ========================
// AXIOS SETUP
// ========================

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const API: AxiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
});

// ========================
// REFRESH LOGIC STATE
// ========================

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (data: { error?: unknown; token?: string }) => {
  failedQueue.forEach((prom) => {
    if (data.error) {
      prom.reject(data.error);
    } else if (data.token) {
      prom.resolve(data.token);
    }
  });

  failedQueue = [];
};

// ========================
// REQUEST INTERCEPTOR
// ========================

API.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    config.headers = config.headers || {};

    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  }
);

// ========================
// RESPONSE INTERCEPTOR (REFRESH TOKEN)
// ========================

API.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as RetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((queueError: unknown) => Promise.reject(queueError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await API.post<LoginResponse>("/refresh");
        const newToken = response.data.token;

        localStorage.setItem("token", newToken);
        API.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

        processQueue({ token: newToken });

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        return API(originalRequest);
      } catch (refreshError: unknown) {
        processQueue({ error: refreshError });
        localStorage.removeItem("token");
        window.location.replace("/login");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

// ========================
// AUTH API METHODS
// ========================

export const login = (data: LoginRequest) =>
  API.post<LoginResponse>("/login", data);

export const register = (data: RegisterRequest) =>
  API.post<APIMessageResponse>("/register", data);

export const getProfile = () => API.get<ProfileData>("/profile");

export const updateProfile = (data: ProfileUpdateRequest) =>
  API.put<APIMessageResponse>("/profile", data);

export const deleteProfile = () =>
  API.delete<APIMessageResponse>("/profile");

export const refreshToken = () =>
  API.post<LoginResponse>("/refresh");

// ========================
// EXPORT
// ========================

export default API;