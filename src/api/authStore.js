let accessToken = null;
let adminStatus = null;
let activeOrgId = null;

const SESSION_KEY = "has_session";

export const setAccessToken = (token, isAdmin) => {
  accessToken = token;
  adminStatus = isAdmin;

  if (token) {
    localStorage.setItem(SESSION_KEY, "true");
  }
};

export const getAccessToken = () => accessToken;

export const getAdminStatus = () => adminStatus;

export const hasSession = () => {
  return localStorage.getItem(SESSION_KEY) === "true";
};

export const clearAccessToken = () => {
  accessToken = null;
  adminStatus = null;
  activeOrgId = null;
  localStorage.removeItem("active_org");
  localStorage.removeItem(SESSION_KEY);
};

export const setActiveOrgId = (id) => {
  activeOrgId = id;
  localStorage.setItem("active_org", id);
};

export const getActiveOrgId = () => {
  if (activeOrgId) return activeOrgId;
  return localStorage.getItem("active_org");
};
