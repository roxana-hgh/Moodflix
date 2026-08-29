import { notFound } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { getListWithItems } from "@/features/lists/queries";
import { toListDetail } from "@/features/lists/types";
import { ListDetailView } from "@/features/lists/components/list-detail-view";

interface ListPageProps {
  params: Promise<{ listId: string }>;
}

export default async function ListPage({ params }: ListPageProps) {
  const { listId } = await params;
  const userId = await getCurrentUserId();

  const result = await getListWithItems(listId, userId);
  if (!result) notFound();

  const list = toListDetail(result.list, result.isOwner);

  return <ListDetailView list={list} />;
}