import assort_api from "./axios";
import { APP_POINTS } from "./apiConfig";
import { clearAccessToken } from "./authStore";
import { closeAllSockets } from "@/websocket/websocketManager";

export const logout = async (isAdmin = false) => {
  try {
    await assort_api.post(APP_POINTS.AUTH + "logout/");
  } catch (err) {
    console.log(err);
    // ignore errors (token may already be invalid)
  } finally {
    closeAllSockets();
    
    clearAccessToken();

    localStorage.setItem("logout", Date.now());

    if (isAdmin) {
      window.location.href = "/platform/login";
    } else {
      window.location.href = "/login";
    }
  }
};

window.addEventListener("storage", (event) => {
  if (event.key === "logout") {
    closeAllSockets();

    clearAccessToken();

    window.location.href = "/login";
  }
});
