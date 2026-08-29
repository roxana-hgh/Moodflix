import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { getUserListDetailByType } from "@/features/lists/queries";
import { ListDetailView } from "@/features/lists/components/list-detail-view";

export default async function FavoritesPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const list = await getUserListDetailByType(userId, "FAVORITE");
  // Shouldn't happen post-registration hook, but don't crash the page if it does.
  if (!list) redirect("/lists");

  return <ListDetailView list={list} />;
}