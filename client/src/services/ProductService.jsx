import axiosClient from "../config/APIConfig.jsx";

//------------------- Supplier ------------------//

export const createSupplier = async (supplierData) => {
    const response = await axiosClient.post("/product/supplier", supplierData);
    return response || null
}

export const updateSupplier = async (supplierData) => {
    const response = await axiosClient.put("/product/supplier", supplierData);
    return response || null
}

export const updateSupplierStatus = async (id) => {
    const response = await axiosClient.put("/product/supplier/status", id);
    return response || null
}

export const getSupplierList = async () => {
    const response = await axiosClient.get("/product/supplier/list");
    return response || null
}

export const getTotalSupplierCount = async () => {
    try {
        const response = await axiosClient.get("/product/stats/supplier");
        return response?.data || null;
    } catch (error) {
        console.error('Error fetching supplier count:', error);
        return null;
    }
};

//------------------- Accessories and Succulents ------------------//

export const createSucculent = async (succulentData) => {
    const response = await axiosClient.post("/product/succulent", succulentData);
    return response || null
}

export const receiveGoods = async (receiveData) => {
    const response = await axiosClient.post("/product/receive-goods", receiveData);
    return response || null
}

export const getSucculents = async () => {
    const response = await axiosClient.get("/product/succulents");
    return response || null
}

export const getAccessories = async () => {
    const response = await axiosClient.get("/product/accessories");
    return response || null

}
