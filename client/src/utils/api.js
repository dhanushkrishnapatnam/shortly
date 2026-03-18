import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.error || err.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export const shortenUrl = (payload) => api.post("/shorten", payload);

export const getStats = (code, manageToken) =>
  api.get(`/stats/${code}`, {
    headers: { "X-Manage-Token": manageToken },
  });

export const getBatchUrls = (links) =>
  api.post("/urls/batch", { links });

export const deleteUrl = (code, manageToken) =>
  api.delete(`/urls/${code}`, {
    headers: { "X-Manage-Token": manageToken },
  });

export default api;
