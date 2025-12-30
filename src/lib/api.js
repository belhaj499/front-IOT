import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8083/api", // ✅ CHANGÉ (8083 + /api)
});

// ✅ CHANGÉ : X-Auth-Token ➜ Authorization
export function setToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = token;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
}

export function initToken() {
  const token = localStorage.getItem("token");
  if (token) {
    api.defaults.headers.common["Authorization"] = token;
  }
}
