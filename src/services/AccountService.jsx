import axiosClient from "../config/APIConfig.jsx";

export const signOut = async () => {
    const response = await axiosClient.post("/api/v1/account/logout");
    return response || null
}

export const getAccess = async () => {
    const response = await axiosClient.post("/api/v1//account/access")
    return response || null;
}

export const viewProfile = async () => {
    const response = await axiosClient.post("/api/v1//account/profile");
    return response || null
}

export const updateProfile = async (userProfile) => {
    const response = await axiosClient.put("/api/v1//account/profile", userProfile);
    return response || null
}

export const viewAccountBuyerList = async () => {
    const response = await axiosClient.post("/api/v1//account/buyer/list");
    return response || null
}

export const getTotalBuyerCount = async () => {
    const response = await axiosClient.get("/api/v1//account/stats/buyer");
    return response || null
}

export const activateAccount = async (accountId) => {
    const response = await axiosClient.put("/api/v1//account/unban", { accountId });
    return response || null;
}

export const banAccount = async (accountId) => {
    const response = await axiosClient.put("/api/v1//account/ban", { accountId });
    return response || null;
}
