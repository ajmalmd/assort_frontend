import { getAccessToken } from "@/api/authStore";

export const SOCKET_HOST = import.meta.env.VITE_SOCKET_URL || "localhost:8000";

export const getWsProtocol = () =>
  window.location.protocol === "https:" ? "wss" : "ws";

export const buildSocketUrl = (path, orgId) => {
  const token = getAccessToken();

  const params = new URLSearchParams({
    token,
    org_id: String(orgId),
  });

  return `${getWsProtocol()}://${SOCKET_HOST}${path}?${params.toString()}`;
};

export const SOCKET_PATHS = {
  notification: () => "/ws/notification/list/",
  chatList: () => "/ws/chat/list/",
  room: (roomId) => `/ws/chat/rooms/${roomId}/`,
};
