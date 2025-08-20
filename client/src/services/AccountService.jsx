import axiosClient from "../config/APIConfig.jsx";

export const signout = async () => {
    const response = await axiosClient.post("/account/logout");
    return response || null
}
