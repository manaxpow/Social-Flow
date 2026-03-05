import { authService } from "@/services/auth/auth.service";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// Định nghĩa thêm cờ _retry để Axios Config không bị lỗi TypeScript
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Định nghĩa interface cho cấu trúc dữ liệu lỗi trả về từ API
interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Biến state để quản lý refresh token
let isRefreshing = false;

// Sử dụng unknown cho Promise reject thay vì any
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Hàm xử lý các request đang chờ trong lúc refresh token
// Xác định rõ error phải là Error object hoặc null
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Nếu lỗi 401 (Unauthorized) và chưa từng thử retry
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Bỏ qua nếu lỗi 401 đến từ chính api refresh-token hoặc login để tránh vòng lặp vô hạn
      if (
        originalRequest.url?.includes("/auth/refresh-token") ||
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/logout")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Nếu đang refresh, đưa các request lỗi vào hàng đợi (Queue)
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Khi refresh xong, gọi lại request cũ
            return api(originalRequest);
          })
          .catch((err: unknown) => {
            return Promise.reject(err);
          });
      }

      // Đánh dấu request này đã retry
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi service refresh token của bạn
        const response = await authService.refreshToken();

        if (response.isSuccess) {
          // Xử lý thành công -> Chạy lại toàn bộ request trong Queue
          processQueue(null);
          return api(originalRequest);
        } else {
          // Refresh thất bại (VD: refresh token hết hạn) -> Xóa Queue và đăng xuất
          processQueue(new Error("Refresh token failed"));
          await authService.logout();
          return Promise.reject(error);
        }
      } catch (refreshError: unknown) {
        // Có lỗi mạng hoặc server khi gọi refresh. Ép kiểu an toàn (Type Narrowing)
        const err =
          refreshError instanceof Error
            ? refreshError
            : new Error(String(refreshError));
        processQueue(err);
        if (window.location.pathname !== "/auth/login") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Xử lý message lỗi thông thường không dùng any
    if (error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      error.message =
        errorData.detail || errorData.message || "Something went wrong";
    }

    return Promise.reject(error);
  },
);

export default api;
