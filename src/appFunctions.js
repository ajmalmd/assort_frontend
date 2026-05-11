export const formatEnum = (value) => {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace("-", " ")
    .replace("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/);

  if (words.length >= 2) {
    return ((words[0][0] || "") + (words[1][0] || "")).toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
};

export const formatDate_MmmDD_YYYY = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDate_d_m_yyyy = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

const formatDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const today_localdate = formatDate(new Date());

// Role Checks
export const isOrgOwner = (role) => role === "OWNER";

export const isOrgAdmin = (role) => role === "ADMIN";

export const isOrgProjectManager = (role) => role === "PROJECT_MANAGER";

export const isOrgOwnerorAdmin = (role) => ["OWNER", "ADMIN"].includes(role);

export const hasProjectRight = (role) =>
  ["OWNER", "ADMIN", "PROJECT_MANAGER"].includes(role);
