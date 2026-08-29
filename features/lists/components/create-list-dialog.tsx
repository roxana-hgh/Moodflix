"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCreateCustomList } from "../hooks";

export function CreateListDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const createList = useCreateCustomList();

  function handleCreate() {
    if (!name.trim()) return;
    createList.mutate(
      { name: name.trim(), isPublic },
      {
        onSuccess: (result) => {
          if (result.success) {
            setOpen(false);
            setName("");
            setIsPublic(false);
          }
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group flex flex-col gap-2 rounded-lg border border-dashed border-muted-foreground/30 p-3 text-left transition-colors hover:border-primary"
        >
          <div className="relative grid grid-cols-2 gap-1 overflow-hidden rounded-md">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted/60" />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition-colors group-hover:text-primary">
                <Plus className="h-5 w-5" />
              </div>
            </div>
          </div>
          <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
            Create new list
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create a new list</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="list-name">Name</Label>
            <Input
              id="list-name"
              autoFocus
              placeholder="e.g. Best Sci-Fi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="list-public">Public</Label>
              <span className="text-xs text-muted-foreground">Anyone with the link can view it</span>
            </div>
            <Switch id="list-public" checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <Button type="button" onClick={handleCreate} disabled={!name.trim() || createList.isPending}>
            {createList.isPending ? "Creating…" : "Create list"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}