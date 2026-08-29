"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteList } from "../hooks";

interface DeleteListDialogProps {
  listId: string;
  listName: string;
}

export function DeleteListDialog({ listId, listName }: DeleteListDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const deleteList = useDeleteList();

  function handleDelete() {
    deleteList.mutate(
      { listId },
      {
        onSuccess: (result) => {
          if (result.success) {
            setOpen(false);
            router.push("/lists");
          }
        },
      }
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 rounded-full text-destructive hover:text-destructive"
        >
          <Trash2 className="size-3.5" /> Delete
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{listName}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the list and everything saved in it. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleteList.isPending}>
            {deleteList.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}