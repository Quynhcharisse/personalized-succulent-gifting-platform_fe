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
    const response = await axiosClient.post("/account/profile");
    return response || null
}

export const updateProfile = async (userProfile) => {
    const response = await axiosClient.put("/account/profile", userProfile);
    return response || null
}

export const viewAccountBuyerList = async () => {
    const response = await axiosClient.post("/account/buyer/list");
    return response || null
}

export const getTotalBuyerCount = async () => {
    const response = await axiosClient.get("/account/stats/buyer");
    return response || null
}

export const activateAccount = async (accountId) => {
    const response = await axiosClient.put("/account/unban", { accountId });
    return response || null;
}

export const banAccount = async (accountId) => {
    const response = await axiosClient.put("/account/ban", { accountId });
    return response || null;
}
