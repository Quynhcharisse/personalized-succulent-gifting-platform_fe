import axiosClient from "../config/APIConfig.jsx";

export async function createPaymentUrl(productData) {
  return axiosClient.post("/payment", productData);
}
