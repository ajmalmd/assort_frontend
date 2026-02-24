let accessToken = null;
let adminStatus = null;

export const setAccessToken = (token, isAdmin) => {
  accessToken = token;
  adminStatus = isAdmin;
};

export const getAccessToken = () => accessToken;

export const getAdminStatus = () => adminStatus;

export const clearAccessToken = () => {
  accessToken = null;
  adminStatus = null;
};
