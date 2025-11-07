import axiosClient from "../config/APIConfig.jsx";

export const confirmPayment = async (payload) => {
  return axiosClient.post("/payment/confirm", payload);
};



