import axiosClient from "../config/APIConfig.jsx";

export const viewProvinces = async () => {
    const response = await axiosClient.get("/ghn/provinces");
    return response || null;
};
export const viewDistricts = async (provinceId) => {
    const response = await axiosClient.get(`/ghn/districts?provinceId=${provinceId}`);
    return response || null;
  };
  
  export const viewWards = async (districtId) => {
    const response = await axiosClient.get(`/ghn/wards?districtId=${districtId}`);
    return response || null;
  };
