import axiosClient from "../config/APIConfig.jsx";

export const createSucculent = async (succulentData) => {
    try {
        const response = await axiosClient.post("/product/succulent", succulentData);
        return response.data || null;
    } catch (error) {
        console.error("Error creating succulent:", error);
        throw error;
    }
}
