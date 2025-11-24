import {refreshToken} from "../services/AuthService.jsx";
import axios from "axios";

// Sử dụng environment variable hoặc fallback về localhost
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://personalized-succulent-gifting-platform.onrender.com/api/v1'

axios.defaults.baseURL = baseURL;

const axiosClient = axios.create({
    baseURL: axios.defaults.baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

axiosClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            if (originalRequest.url === "/auth/refresh") {
                console.error("Refresh token request failed, redirecting to login.");
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            }

            const publicEndpoints = ["/account/access", "/product/list"];
            const isPublicEndpoint = publicEndpoints.some(endpoint => originalRequest.url.startsWith(endpoint));

            if (isPublicEndpoint) {
                return Promise.reject(error);
            }

            try {
                const refreshRes = await refreshToken();
                if (refreshRes.status === 200) {
                    return axiosClient(originalRequest);
                } else {
                    window.location.href = "/login";
                }
            } catch (refreshError) {
                console.log("Token refresh failed:", refreshError);
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    })

export default axiosClient;
