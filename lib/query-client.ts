import { QueryClient, isServer } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // avoid an immediate refetch on mount for data just prefetched server-side
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always a fresh client — never share one across requests/users
    return makeQueryClient();
  }

  // Browser: reuse the same client across renders/suspense
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}