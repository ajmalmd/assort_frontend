import config from "@/config";

export const BASE_URL = config.apiUrl;
export const MEDIA_URL = config.mediaUrl;

export const APP_POINTS = {
  REFRESH_TOKEN: "auth/token-refresh/",
  AUTH: "auth/",
  PLATFORM: "platform/",
  ORGANIZATIONS: "organizations/",
  INVITATIONS: "invitations/",
  SUBSCRIPTIONS: "subscriptions/",
  DEPARTMENTS: "departments/",
  PROJECTS: "projects/",
  CHAT: "chat/",
  CALL: "call/",
  NOTIFICATIONS: "notifications/"
};
