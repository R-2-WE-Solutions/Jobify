// src/api/profile.js

const API_BASE =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE ||
    "https://localhost:7176";

function getToken() {
    const token =
        localStorage.getItem("jobify_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt") ||
        localStorage.getItem("authToken");

    // prevent "Bearer null" / "Bearer undefined"
    return token && token.trim().length > 0 ? token : null;
}

async function request(path, options = {}) {
    const token = getToken();
    if (!token) throw new Error("No token found. Please login again.");

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
        },
    });

    if (res.status === 401) {
        // token missing/expired/invalid
        throw new Error("Unauthorized (401). Please login again.");
    }

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
    }

    return res.json();
}

// ✅ GET /api/Profile  -> returns { role, profile }
export async function getProfile() {
    return request("/api/Profile", { method: "GET" });
}

// ✅ PUT /api/Profile -> your backend returns { message, profile } (NOT role)
// We'll return a consistent shape: { role, profile } by re-fetching after update.
export async function updateProfile(payload) {
    await request("/api/Profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    // ✅ always get fresh role+profile in one shape
    return getProfile();
}
