import axiosClient from "../config/APIConfig.jsx";

export const refreshToken = async () => {
    const response = await axiosClient.post("/auth/refresh");
    return response || null
}

export const signIn = async (email, name, avatar) => {
    const response = await axiosClient.post("/auth/login", {
            email: email,
            name: name,
            avatar: avatar
        }
    );
    return response || null
}
