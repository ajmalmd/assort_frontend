import axios from "axios";
import { clearAccessToken, getAccessToken, getAdminStatus, setAccessToken } from "./authStore";
import { APP_POINTS, BASE_URL } from "./apiConfig";

const assort_api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

// Attach access token
assort_api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
assort_api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isLoginRequest = originalRequest.url?.includes("login");
    const isRefreshRequest = originalRequest.url?.includes(
      APP_POINTS.REFRESH_TOKEN
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isLoginRequest &&
      !isRefreshRequest
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(assort_api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          BASE_URL + APP_POINTS.REFRESH_TOKEN,
          {},
          { withCredentials: true }
        );

        const { access, is_admin } = response.data;

        setAccessToken(access, is_admin);
        isRefreshing = false;
        onRefreshed(access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return assort_api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        clearAccessToken();

        const isAdmin = getAdminStatus();
        if (isAdmin) {
          window.location.href = "/platform/login";
        } else {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default assort_api;