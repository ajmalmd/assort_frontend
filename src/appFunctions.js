export const formatEnum = (value) => {
  if (!value) return "";
  return value
    .toLowerCase()
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

// Role Checks
export const isOrgOwner = (role) => role === "OWNER";

export const isOrgAdmin = (role) => role === "ADMIN";

export const isOrgProjectManager = (role) => role === "PROJECT_MANAGER";

export const isOrgOwnerorAdmin = (role) => ["OWNER", "ADMIN"].includes(role);

export const hasProjectRight = (role) =>
  ["OWNER", "ADMIN", "PROJECT_MANAGER"].includes(role);
