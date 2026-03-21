import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

type FailedQueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const API: AxiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
});

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

API.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    config.headers = config.headers || {};
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
);

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
        const response = await API.post<{ token: string }>("/refresh");
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
  },
);

// Response interceptor – handle 401 + retry
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

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
          .catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await API.post("/refresh");
        const newToken = response.data.token;

        localStorage.setItem("token", newToken);
        API.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

        processQueue({ token: newToken });

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        return API(originalRequest);
      } catch (e) {
        processQueue({ error: e });
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
