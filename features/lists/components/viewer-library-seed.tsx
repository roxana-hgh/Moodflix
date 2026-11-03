import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getCurrentUserId } from "@/lib/auth";
import { listsKeys } from "../keys";
import { getViewerLibrary } from "../queries";

/**
 * Streams the viewer's saved titles into the React Query cache with the first
 * response. Render it inside <Suspense>: it reads the session, so it is the only
 * per-user part of the main layout, and everything around it stays cacheable.
 */
export async function ViewerLibrarySeed() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const queryClient = new QueryClient();
  queryClient.setQueryData(listsKeys.library, await getViewerLibrary(userId));

  return <HydrationBoundary state={dehydrate(queryClient)} />;
}
