import assort_api from "./axios";
import { APP_POINTS } from "./apiConfig";
import { clearAccessToken, setAccessToken } from "./authStore";


export const tryRefresh = async () => {
  try {
    const response = await assort_api.post(
      APP_POINTS.REFRESH_TOKEN
    );

    const { access, is_admin } = response.data;
    setAccessToken(access, is_admin);

    return true;
  } catch {
    clearAccessToken();
    return false;
  }
};
