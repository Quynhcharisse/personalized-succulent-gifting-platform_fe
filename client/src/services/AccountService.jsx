import axiosClient from "../config/APIConfig.jsx";

export const signOut = async () => {
    const response = await axiosClient.post("/account/logout");
    return response || null
}

export const getAccess = async () => {
    const response = await axiosClient.post("/account/access")
    return response || null;
}

export const viewProfile = async () => {
    const response = await axiosClient.get("/account/profile");
    return response || null
}

export const updateProfile = async (userProfile) => {
    const response = await axiosClient.put("/account/profile", userProfile);
    return response || null
}
