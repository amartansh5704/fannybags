// src/services/artistWalletService.js
import Cookies from "js-cookie";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000/api";

function getToken() {
  return Cookies.get("access_token"); // ✅ USE COOKIES, NOT localStorage
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    body: options.body || null
  });

  let data = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const artistWalletService = {
  async getBalance() {
    const res = await apiRequest("/api/wallet/balance");
    return res.data;
  },

  async withdraw(amount) {
    return apiRequest("/api/wallet/artist/withdraw", {
      method: "POST",
      body: JSON.stringify({ amount })
    });
  }
};
