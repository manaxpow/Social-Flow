import axios from "axios";

const api = axios.create({
  // Use environment variables for flexibility
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api",
  timeout: 10000, // 10 seconds
  withCredentials: true, // Include cookies in requests
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // if (error.response?.status === 401) {
    //   console.error("Session expired. Please log in again.");
    //   window.location.href = "/auth/login";
    // }

    if (error.response?.data) {
      error.message =
        error.response.data.detail ||
        error.response.data.message ||
        "Something went wrong";
    }

    return Promise.reject(error); // Trả về đối tượng error gốc
  },
);

export default api;
