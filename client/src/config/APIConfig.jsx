import axios from "axios";

// Read API base URL from env, fallback to localhost:8080
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : "http://localhost:8080/api/v1"

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
})

export default axiosClient