import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { getUserListDetailByType } from "@/features/lists/queries";
import { ListDetailView } from "@/features/lists/components/list-detail-view";

export default async function WatchlistPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const list = await getUserListDetailByType(userId, "WATCHLIST");
  if (!list) redirect("/lists");

  return <ListDetailView list={list} />;
}