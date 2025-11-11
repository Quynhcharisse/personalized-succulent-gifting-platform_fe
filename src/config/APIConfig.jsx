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
        // Log error details for debugging
        const errorDetails = {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            url: error.config?.url
        };
        
        console.warn('⚠️ Failed to get access token:', errorDetails);
        
        tokenFetchPromise = null;
        cachedToken = null;
        
        // Return null instead of throwing - allow requests without token
        // This is OK for public endpoints like /product/list
        return null;
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

        const skipTokenEndpoints = ['/auth/login', '/auth/refresh', '/account/access'];
        const shouldSkipToken = skipTokenEndpoints.some(endpoint => config.url?.includes(endpoint));
        
        // Public endpoints (có thể truy cập không cần token)
        const publicEndpoints = ['/product', '/product/list', '/succulent'];
        const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
        
        if (!shouldSkipToken) {
            const token = await getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                // console.log('✅ Token attached to request:', config.url);
            } else if (!isPublicEndpoint) {
                // Chỉ warn nếu endpoint không phải public
                console.warn('⚠️ No token available for protected endpoint:', config.url);
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
