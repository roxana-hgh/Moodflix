"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUpdateList } from "../hooks";
import type { ListDetail } from "../types";

interface EditListDialogProps {
  list: ListDetail;
}

export function EditListDialog({ list }: EditListDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(list.name);
  const [isPublic, setIsPublic] = useState(list.isPublic);
  const updateList = useUpdateList();

  function handleSave() {
    if (!name.trim()) return;
    updateList.mutate(
      { listId: list.id, name: name.trim(), isPublic },
      {
        onSuccess: (result) => {
          if (result.success) {
            setOpen(false);
            router.refresh(); // this page is server-rendered, so re-pull it for the new name/badge
          }
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2 rounded-full">
          <Pencil className="size-3.5" /> Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit list</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-list-name">Name</Label>
            <Input
              id="edit-list-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="edit-list-public">Public</Label>
              <span className="text-xs text-muted-foreground">Anyone with the link can view it</span>
            </div>
            <Switch id="edit-list-public" checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <Button type="button" onClick={handleSave} disabled={!name.trim() || updateList.isPending}>
            {updateList.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}