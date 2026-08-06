import 'server-only';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

type TmdbMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface TmdbRequestOptions {
  method?: TmdbMethod;
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  cache?: RequestCache; // mutually exclusive with `next` — Next.js throws if both are set
  next?: NextFetchRequestConfig;
}

function buildUrl(endpoint: string, params?: TmdbRequestOptions['params']) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

// services/tmdb/client.ts
export async function serverApi<T = unknown>(
  endpoint: string,
  { method = 'GET', params, body, cache, next }: TmdbRequestOptions = {}
): Promise<T> {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) throw new Error('TMDB_API_TOKEN is not set');

  try {
    const res = await fetch(buildUrl(endpoint, params), {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      cache,
      next,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`TMDB ${method} ${endpoint} failed (${res.status}): ${errText}`);
    }

    return res.json() as Promise<T>;
  } catch (err) {
    // Surface the real cause instead of swallowing it
    console.error('[serverApi] fetch error:', err, (err as any)?.cause);
    throw err;
  }
}