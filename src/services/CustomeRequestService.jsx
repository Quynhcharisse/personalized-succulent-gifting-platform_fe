import axiosClient from "../config/APIConfig.jsx";

//------------------- Custom Request Seller ------------------//
export const viewRequestBySeller = async () => {
    // Support pagination/sorting via query params
    const response = await axiosClient.get("/custom/custom-request/list");
    return response || null
}

export const viewRequestDetailBySeller = async (id) => {
    const response = await axiosClient.get(`/custom/custom-request/list/${id}`);
    return response || null
}

export const processCustomRequest = async (requestData, approved = "true") => {
    const response = await axiosClient.put(`/custom/custom-request/design-image?a=${approved}`, requestData);
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

export const createRevision = async (requireData) => {
    const response = await axiosClient.put("/custom/custom-request/revision", requireData);
    return response || null
}

export const confirmCustomRequest = async (id) => {
    const response = await axiosClient.put(`/custom/custom-request/status/${id}`);
    return response || null;
};


