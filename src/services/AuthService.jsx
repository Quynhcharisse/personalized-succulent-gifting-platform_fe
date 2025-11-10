import axiosClient, { clearTokenCache } from "../config/APIConfig.jsx";

export const refreshToken = async () => {
    const response = await axiosClient.post("/auth/refresh");
    clearTokenCache(); // Clear cache sau khi refresh token
    return response || null
}

export const signIn = async (email, name, avatar) => {
    const response = await axiosClient.post("/auth/login", {
            email: email,
            name: name,
            avatar: avatar
        }
    );
    clearTokenCache(); // Clear cache sau khi login thành công
    return response || null
}
