import { API_BASE_URL } from "../config/constants";
import axios from "axios";

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Se o erro veio da própria rota de refresh, não tentar novamente
    if (originalRequest.url?.includes("/api/auth/refresh")) {
      return Promise.reject(error);
    }

    try {
      // Refresh token vem via cookie httpOnly — sem body necessário
      const { data } = await httpClient.post("/api/auth/refresh");
      const newToken = data.accessToken;

      localStorage.setItem("accessToken", newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return httpClient(originalRequest);
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:session-expired"));
      return Promise.reject(error);
    }
  },
);

export default httpClient;
