import { getSession } from "next-auth/react";

export async function authFetch(url: string, options: RequestInit = {}) {
  const session = await getSession();
  const token = session?.user?.adminToken; // get admin token

  if (!token) throw new Error("Unauthorized");

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": token, // pass token to middleware
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error(`Request failed: ${res.statusText}`);
  }

  return res.json();
}
