import axiosClient from "../config/APIConfig.jsx";

export const getShippingAddresses = async () => {
    const response = await axiosClient.get("/address/list");
    return response || null;
}

export const createShippingAddress = async (payload) => {
    const response = await axiosClient.post("/address", payload);
    return response || null;
}

export const getDefaultShippingAddress = async () => {
    return await axiosClient.get("/address/default");
  };

  export const setDefaultShippingAddress = (id) => {
    return axiosClient.put(`/address/${id}`);
  };
  