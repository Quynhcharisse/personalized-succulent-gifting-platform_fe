import axiosClient from "../config/APIConfig.jsx";

export const getShippingAddresses = async () => {
    const response = await axiosClient.get("/address/list");
    return response || null;
}
