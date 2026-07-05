const API_URL = "http://localhost:8000";

export async function apiFetch(
    endpoint: string,
    options?: RequestInit
) {
    const response = await fetch(`${API_URL}${endpoint}`, options);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
}
