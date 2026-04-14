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
