import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { UserListsView } from "@/features/lists/components/user-lists-view";

export default async function ListsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  return (
    <div className="container mx-auto flex flex-col gap-6 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Your Lists</h1>
        <p className="text-sm text-muted-foreground">Watch Later, Favorites, and everything you&apos;ve built.</p>
      </div>

      <UserListsView />
    </div>
  );
}