import axios from "axios";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
});

// Request interceptor: inject access token from localStorage
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: placeholder for refresh token logic on 401
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // TODO: implement refresh token flow here when backend is ready.
    // On 401, call POST /api/auth/refresh with refreshToken from localStorage,
    // update accessToken, and retry the original request.
    if (error.response?.status === 401) {
      // placeholder — no action for now
    }
    return Promise.reject(error);
  },
);

export default httpClient;
