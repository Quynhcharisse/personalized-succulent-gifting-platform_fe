import axiosClient from "../config/APIConfig.jsx";

//------------------- Custom Request Seller ------------------//
export const viewRequestBySeller = async (requestData = {}) => {
    // Support pagination/sorting via query params
    const response = await axiosClient.get("/custom/custom-request/list", {requestData});
    return response || null
}

export const viewRequestDetailBySeller = async (id) => {
    const response = await axiosClient.get(`/custom/custom-request/list/${id}`);
    return response || null
}

//------------------- Custom Request For Buyer ------------------//
export const createCustomProductRequest = async (customRequestData) => {
    const response = await axiosClient.post("/custom/custom-request", customRequestData);
    return response || null
}

export const viewCustomProductRequestByBuyer = async () => {
    const response = await axiosClient.post("/custom/custom-request/list");
    return response || null
}

export const createRevision = async (id) => {
    const response = await axiosClient.put(`/custom/custom-request/${id}`);
    return response || null
}


