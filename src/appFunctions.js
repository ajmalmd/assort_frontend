export const formatEnum = (value) => {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};