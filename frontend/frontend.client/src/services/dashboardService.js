const API_BASE = import.meta.env.VITE_API_URL;

export async function getCandidateDashboard() {
  const token = localStorage.getItem("jobify_token");

  const response = await fetch(`${API_BASE}/Dashboard/candidate`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to fetch dashboard");
  }

  return await response.json();
}
