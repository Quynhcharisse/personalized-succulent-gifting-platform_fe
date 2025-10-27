import {refreshToken} from "../services/AuthService.jsx";
import axios from "axios";

// For development: use relative URL to leverage Vite proxy
// For production: use actual API URL
const isDevelopment = import.meta.env.MODE === 'development';
const baseURL = isDevelopment ? '/api/v1' : `${import.meta.env.VITE_API_URL}/api/v1`;

axios.defaults.baseURL = baseURL;

const axiosClient = axios.create({
    baseURL: axios.defaults.baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

axiosClient.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            if (originalRequest.url === "/auth/refresh") {
                console.error("Refresh token request failed, redirecting to login.");
                // Don't redirect if already on login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            }

            // Don't redirect for public endpoints
            const publicEndpoints = ["/account/access", "/product", "/product/list"];
            const isPublicEndpoint = publicEndpoints.some(endpoint => originalRequest.url.startsWith(endpoint));

            if (isPublicEndpoint) {
                // Just reject the error without redirecting for public endpoints
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
