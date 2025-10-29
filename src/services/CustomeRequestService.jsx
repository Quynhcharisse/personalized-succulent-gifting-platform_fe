import axiosClient from "../config/APIConfig.jsx";

//------------------- Custom Request ------------------//
export const createCustomProductRequest = async (customRequestData) => {
    const response = await axiosClient.post("/custom/custom-request", customRequestData);
    return response || null
}

export const createRevision = async (id) => {
    const response = await axiosClient.put(`/custom/custom-request/${id}`);
    return response || null
}


