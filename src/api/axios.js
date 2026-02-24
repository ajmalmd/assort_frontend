import axios from "axios";
import { BASE_URL, APP_POINTS } from "./apiConfig";
import { getAccessToken, setAccessToken, clearAccessToken } from "./authStore";
import { getAdminStatus } from "./authStore";

const assort_api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach access token automatically
assort_api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Auto refresh logic
assort_api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isLoginRequest = originalRequest.url?.includes("login");

    const isRefreshRequest = originalRequest.url?.includes(
      APP_POINTS.REFRESH_TOKEN,
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isLoginRequest &&
      !isRefreshRequest
    ) {
      originalRequest._retry = true;

      try {
        const response = await assort_api.post(APP_POINTS.REFRESH_TOKEN);

        const newAccess = response.data.access;
        const isAdmin = response.data.is_admin;

        setAccessToken(newAccess, isAdmin);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return assort_api(originalRequest);
      } catch (refreshError) {
        const isAdmin = getAdminStatus();

        clearAccessToken();

        if (isAdmin) {
          window.location.href = "/platform/login";
        } else {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default assort_api;
