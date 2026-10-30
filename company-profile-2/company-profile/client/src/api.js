const BASE = import.meta.env.VITE_API_URL || "/api";

// Swap this header for your real auth token (Authorization: Bearer ...)
const headers = (extra = {}) => ({ "x-user-id": "demo-user", ...extra });

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.errors = data.errors || {};
    throw err;
  }
  return data;
}

export const getCompany = () =>
  fetch(`${BASE}/company/me`, { headers: headers() }).then(handle);

export const saveCompany = (payload) =>
  fetch(`${BASE}/company/me`, {
    method: "PUT",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  }).then(handle);

export const uploadLogo = (file) => {
  const fd = new FormData();
  fd.append("logo", file);
  return fetch(`${BASE}/company/me/logo`, {
    method: "POST",
    headers: headers(),
    body: fd,
  }).then(handle);
};

export const removeLogo = () =>
  fetch(`${BASE}/company/me/logo`, {
    method: "DELETE",
    headers: headers(),
  }).then(handle);

export const completeSetup = () =>
  fetch(`${BASE}/company/me/complete`, {
    method: "POST",
    headers: headers(),
  }).then(handle);
