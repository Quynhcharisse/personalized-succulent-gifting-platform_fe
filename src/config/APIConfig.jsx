import {refreshToken} from "../services/AuthService.jsx";
import axios from "axios";

const baseURL = '/api/v1'

axios.defaults.baseURL = baseURL;

const axiosClient = axios.create({
    baseURL: axios.defaults.baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Cache token để tránh gọi /account/access liên tục
let cachedToken = null;
let tokenFetchPromise = null;

const getAccessToken = async () => {
    // Nếu đang fetch token, chờ promise đó
    if (tokenFetchPromise) {
        return tokenFetchPromise;
    }
    
    // Nếu có cache token, dùng luôn
    if (cachedToken) {
        return cachedToken;
    }
    
    // Fetch token mới (dùng POST vì backend có thể yêu cầu POST)
    tokenFetchPromise = axios.post(`${baseURL}/account/access`, {}, {
        withCredentials: true
    }).then(response => {
        if (response.data?.data?.access) {
            cachedToken = response.data.data.access;
            tokenFetchPromise = null;
            return cachedToken;
        }
        tokenFetchPromise = null;
        return null;
    }).catch(error => {
        console.error('⚠️ Failed to get access token:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        });
        tokenFetchPromise = null;
        cachedToken = null;
        throw error;
    });
    
    return tokenFetchPromise;
};

// Clear cache khi cần
export const clearTokenCache = () => {
    cachedToken = null;
    tokenFetchPromise = null;
};

// Request interceptor: Tự động thêm access token vào header
axiosClient.interceptors.request.use(
    async (config) => {
        // Bỏ qua việc thêm token cho endpoint login/refresh/access
        const skipTokenEndpoints = ['/auth/login', '/auth/refresh', '/account/access'];
        const shouldSkipToken = skipTokenEndpoints.some(endpoint => config.url?.includes(endpoint));
        
        if (!shouldSkipToken) {
            try {
                const token = await getAccessToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log('✅ Token attached to request');
                } else {
                    console.warn('⚠️ No token available, request may fail');
                }
            } catch (error) {
                console.error('❌ Cannot get access token, request will proceed without auth');
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Xử lý 401/403
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
