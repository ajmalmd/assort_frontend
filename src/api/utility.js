import assort_api from "./axios";
import { APP_POINTS } from "./apiConfig";
import { clearAccessToken } from "./authStore";

export const logout = async (isAdmin = false) => {
  try {
    await assort_api.post(APP_POINTS.AUTH + "logout/");
  } catch (err) {
    console.log(err)
    // ignore errors (token may already be invalid)
  } finally {
    clearAccessToken();

    if (isAdmin) {
      window.location.href = "/platform/login";
    } else {
      window.location.href = "/login";
    }
  }
};
