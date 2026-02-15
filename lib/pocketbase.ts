const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";
const PB_EMAIL = process.env.PB_ADMIN_EMAIL || "admin@trading.local";
const PB_PASSWORD = process.env.PB_ADMIN_PASSWORD || "Admin12345678";

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAuthToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ identity: PB_EMAIL, password: PB_PASSWORD }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`PocketBase auth failed: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = data.token;
  tokenExpiry = Date.now() + 50 * 60 * 1000; // 50 minutes
  return cachedToken!;
}

export async function pbFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = await getAuthToken();
  return fetch(`${PB_URL}${path}`, {
    ...options,
    headers: {
      Authorization: token,
      ...options?.headers,
    },
  });
}
