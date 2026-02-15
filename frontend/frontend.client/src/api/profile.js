

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
        throw new Error("Unauthorized (401). Please login again.");
    }

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
    }

    return res.json();
}

export async function getProfile() {
    return request("/api/Profile", { method: "GET" });
}

export async function updateProfile(payload) {
    await request("/api/Profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    return getProfile();
}
