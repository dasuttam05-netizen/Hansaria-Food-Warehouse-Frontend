export function getApiOrigin() {
  const envOrigin = process.env.REACT_APP_API_ORIGIN;
  if (envOrigin) {
    return envOrigin.replace(/\/+$/, "");
  }

  if (typeof window === "undefined") {
    return "http://localhost:4001";
  }

  const protocol = window.location.protocol || "http:";
  const host = window.location.hostname || "localhost";
  return `${protocol}//${host}:4001`;
}

export function getApiUrl(path = "") {
  return `${getApiOrigin()}${path}`;
}
