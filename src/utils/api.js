export function getApiOrigin() {
  const origin = process.env.REACT_APP_API_ORIGIN;

  if (!origin) {
    console.error("❌ API ORIGIN not set in environment variables");
    return "";
  }

  // remove trailing slash
  return origin.replace(/\/+$/, "");
}

export function getApiUrl(path = "") {
  return `${getApiOrigin()}${path}`;
}
