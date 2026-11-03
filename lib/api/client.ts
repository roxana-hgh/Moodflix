/** Minimal browser-side GET helper for our own `/api` routes. */
export async function getJson<T>(path: string, params?: URLSearchParams, signal?: AbortSignal): Promise<T> {
  const query = params?.toString();
  const res = await fetch(query ? `${path}?${query}` : path, { signal });
  if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
  return res.json() as Promise<T>;
}
