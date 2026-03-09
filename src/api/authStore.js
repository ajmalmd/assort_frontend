let accessToken = null;
let adminStatus = null;
let activeOrgId = null;

export const setAccessToken = (token, isAdmin) => {
  accessToken = token;
  adminStatus = isAdmin;
};

export const getAccessToken = () => accessToken;

export const getAdminStatus = () => adminStatus;

export const clearAccessToken = () => {
  accessToken = null;
  adminStatus = null;
  activeOrgId = null;
  localStorage.removeItem("active_org");
};

export const setActiveOrgId = (id) => {
  activeOrgId = id;
  localStorage.setItem("active_org", id);
};

export const getActiveOrgId = () => {
  if (activeOrgId) return activeOrgId;
  return localStorage.getItem("active_org");
};