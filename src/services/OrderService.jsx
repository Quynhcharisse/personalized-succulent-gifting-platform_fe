import axiosClient from "../config/APIConfig.jsx";

const OrderService = {
    getOrders: (params = {}) => axiosClient.get('/order', {params}),
    getOrderDetail: (orderId) => {
        if (!orderId && orderId !== 0) {
            return Promise.reject(new Error('orderId is required to fetch order detail'))
        }
        return axiosClient.get(`/order/detail/${orderId}`)
    }
}

export default OrderService