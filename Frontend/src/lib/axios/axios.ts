import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { store } from "@/stores"; // Import Redux store
import type { RootState } from "@/stores"; // Import RootState type

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];
let retryCount = 0;
const MAX_RETRIES = 2;

const processQueue = (error: any, token: string | null = null) => {
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
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle CORS errors (no response available)
    if (!error.response && error.code === 'ERR_NETWORK') {
      console.error('CORS or Network Error:', error.message);
      // Check if this might be a CORS issue by looking at the error message
      if (error.message.includes('Network Error') || error.message.includes('CORS')) {
        console.error('Possible CORS issue. Check backend CORS configuration.');
      }
      return Promise.reject(error);
    }

    // Check retry count to prevent infinite loops
    if (retryCount >= MAX_RETRIES) {
      console.error(`Max retries (${MAX_RETRIES}) reached. Redirecting to login...`);
      retryCount = 0;
      isRefreshing = false;
      failedQueue = [];
      window.location.href = "/auth/login";
      return Promise.reject(error);
    }

    // Nếu lỗi 401 và chưa từng retry request này
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Check if user is logging out - don't refresh token
      const state = store.getState() as RootState;
      if (state.auth.isLoggingOut) {
        console.log("[Axios] User is logging out, skipping token refresh");
        return Promise.reject(error);
      }
      
      // Tránh lặp vô hạn nếu API refresh-token cũng lỗi (400 hoặc 401)
      if (originalRequest.url?.includes("/auth/refresh-token")) {
        console.error(`[Axios] Refresh token failed (${error.response.status}). Immediate redirect to login...`);
        retryCount = 0;
        isRefreshing = false;
        failedQueue = [];
        // Clear auth cache to prevent re-init loop
        sessionStorage.removeItem("auth_cache");
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Nếu đang refresh, đẩy request này vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      retryCount++;

      try {
        console.log(`Attempting to refresh token (attempt ${retryCount}/${MAX_RETRIES})...`);
        // Gọi API refresh token (sử dụng http-only cookie nên không cần truyền data)
        await api.post("/auth/refresh-token");
        
        processQueue(null);
        isRefreshing = false;
        retryCount = 0; // Reset retry count on success

        console.log("Token refreshed successfully. Retrying original request...");
        // Thực hiện lại request ban đầu
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Nếu refresh cũng tèo, thử lại nếu còn retry count,不然 redirect to login
        if (retryCount < MAX_RETRIES) {
          console.warn(`Refresh failed (attempt ${retryCount}/${MAX_RETRIES}). Retrying...`);
          // Let the original request trigger another retry
          return Promise.reject(refreshError);
        } else {
          console.error(`Max refresh attempts (${MAX_RETRIES}) reached. Redirecting to login...`);
          retryCount = 0;
          failedQueue = [];
          window.location.href = "/auth/login";
          return Promise.reject(refreshError);
        }
      }
    }

    // Xử lý thông báo lỗi như cũ
    if (error.response?.data) {
       // @ts-ignore
      error.message = error.response.data.detail || error.response.data.message || "Something went wrong";
    }

    return Promise.reject(error);
  }
);

export default api;