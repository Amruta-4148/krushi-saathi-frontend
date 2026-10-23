const API = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "");
const TOKEN_KEY = "krushi-saathi-session";

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API}${path}`, { ...options, headers });
  } catch {
    throw new Error("Can't reach the Krushi Saathi server. In a second terminal, run: python backend/server.py");
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again.");
  return result;
}

async function storeSession(path, payload) {
  const result = await request(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  localStorage.setItem(TOKEN_KEY, result.token);
  return result;
}

export function signUpFarmer(data) {
  return storeSession("/auth/signup", data);
}

export function signInFarmer(data) {
  return storeSession("/auth/login", data);
}

export function getCurrentFarmer() {
  return request("/auth/me");
}

export async function signOutFarmer() {
  try {
    await request("/auth/logout", { method: "POST", body: "{}" });
  } finally {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getFarmerChats() {
  return request("/chats");
}

export function createFarmerChat() {
  return request("/chats", { method: "POST", body: "{}" });
}

export function getFarmerChat(chatId) {
  return request(`/chats/${chatId}`);
}

export function deleteFarmerChat(chatId) {
  return request(`/chats/${chatId}`, { method: "DELETE" });
}

export function updateFarmerProfile(profile) {
  return request("/profile", { method: "POST", body: JSON.stringify(profile) });
}

export function askAdvisor(question, language, chatId) {
  return request("/chat", {
    method: "POST",
    body: JSON.stringify({ question, language, chat_id: chatId }),
  });
}
