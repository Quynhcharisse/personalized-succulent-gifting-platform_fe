import axiosClient from "../config/APIConfig.jsx";

export async function getWalletBalance() {
  return axiosClient.get("/wallet");
}

export async function cancelPaymentLink(orderCode) {
  return axiosClient.delete("/wallet", {
    params: { orderCode }
  });
}




