import axios from "axios"

// Resolve API base URL from env, fallback to local dev
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
axios.defaults.baseURL = baseURL;

// Main axios instance used across the app
const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Raw axios instance WITHOUT interceptors for refresh calls to avoid recursion
const rawAxios = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        if (originalRequest?.url === "/auth/refresh") {
          console.error("Refresh token request failed, redirecting to login.");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        try {
          const refreshRes = await rawAxios.post("/auth/refresh");
          if (refreshRes.status === 200) {
            return axiosClient(originalRequest);
          }
          window.location.href = "/login";
        } catch (refreshError) {
          console.log("Token refresh failed:", refreshError);
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
)

export default axiosClient;
