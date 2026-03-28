import axios from "axios";
import {
  clearAccessToken,
  getAccessToken,
  getActiveOrgId,
  getAdminStatus,
  setAccessToken,
} from "./authStore";
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

  const url = (config.baseURL || "") + (config.url || "");

  // PUBLIC ROUTES (no token, no org)
  const PUBLIC_ROUTES = [
    "/api/auth/login",
    "/api/auth/token-refresh",
    "/api/auth/logout",

    "/api/auth/forgot-password",
    "/api/auth/verify-otp",
    "/api/auth/resend-otp",
    "/api/auth/set-password",

    "/api/organizations/create",
    "/api/organizations/verify-otp",
    "/api/organizations/resend-otp",
    "/api/organizations/set-password",

    "/api/subscriptions/plans",
  ];

  const isPublicRoute = PUBLIC_ROUTES.some((path) => url.includes(path));

  // PLATFORM ADMIN ROUTES (token required, NO org)
  const isPlatformRoute = url.includes("/api/platform/");

  // Skip org header for public + platform routes
  if (!isPublicRoute && !isPlatformRoute) {
    const orgId = getActiveOrgId();

    if (!orgId) {
      return Promise.reject({
        message: "Organization context missing",
        code: "ORG_REQUIRED",
      });
    }

    config.headers["X-ORG-ID"] = orgId;
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
      APP_POINTS.REFRESH_TOKEN,
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

            const orgId = getActiveOrgId();
            if (orgId) {
              originalRequest.headers["X-ORG-ID"] = orgId;
            }

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
          { withCredentials: true },
        );

        const { access, is_admin } = response.data;

        setAccessToken(access, is_admin);
        isRefreshing = false;
        onRefreshed(access);

        originalRequest.headers.Authorization = `Bearer ${access}`;

        const orgId = getActiveOrgId();
        if (orgId) {
          originalRequest.headers["X-ORG-ID"] = orgId;
        }

        return assort_api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;

        const isAdmin = getAdminStatus();

        clearAccessToken();

        onRefreshed(null);

        if (isAdmin) {
          window.location.replace("/platform/login");
        } else {
          window.location.replace("/login");
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default assort_api;
