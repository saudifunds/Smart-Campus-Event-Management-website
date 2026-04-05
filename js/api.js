// ===== Backend API Helper =====
const API_BASE_URL = "http://localhost:4000/api";

function getAuthToken() {
  return null;
}

function setAuthSession(user) {
  localStorage.setItem("loggedInUser", JSON.stringify(user));
}

async function clearAuthSession() {
  localStorage.removeItem("loggedInUser");
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
  } catch(e) {}
}

async function apiRequest(path, options = {}) {
  const token = getAuthToken();

  const headers = {
    ...(options.headers || {}),
  };
  
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  options.credentials = "include";

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    const isJson = res.headers
      .get("content-type")
      ?.includes("application/json");
    const data = isJson ? await res.json() : null;

    if (!res.ok) {
      const message = data?.message || "Request failed";
      throw new Error(message);
    }

    return data;
  } catch (err) {
    // Handle network errors (server not running, CORS, etc.)
    if (err.message === "Failed to fetch" || err.name === "TypeError") {
      throw new Error(
        "Cannot connect to server. Please make sure the backend server is running on http://localhost:4000"
      );
    }
    throw err;
  }
}


