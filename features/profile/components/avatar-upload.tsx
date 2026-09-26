// features/profile/components/avatar-upload.tsx
"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { uploadAvatar, removeAvatar } from "../actions";
import { ImageCropDialog } from "./image-crop-dialog";
import { getInitials } from "../types";
import { authClient } from "@/lib/auth-client";

interface AvatarUploadProps {
  name: string;
  avatarUrl: string | null;
}

export function AvatarUpload({ name, avatarUrl }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(avatarUrl);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawImage(URL.createObjectURL(file));
    setCropOpen(true);
    e.target.value = "";
  }


  function handleSave(blob: Blob) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", blob, "avatar.webp");
      const result = await uploadAvatar(formData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setPreview(result.data!.url);
      setCropOpen(false);
      toast.success("Avatar updated");
      await authClient.getSession({ query: { disableCookieCache: true } });
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeAvatar();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setPreview(null);
      toast.success("Avatar removed");
      await authClient.getSession({ query: { disableCookieCache: true } });
    });
  }
  return (
    <>
      <div className="group relative">
        <Avatar className="size-18 border-2 border-primary/90 shadow-md sm:size-22">
          <AvatarImage src={preview ?? undefined} alt={name} />
          <AvatarFallback className="bg-background/80 text-2xl font-semibold text-primary">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={isPending}
              className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-background bg-secondary text-secondary-foreground shadow transition-transform group-hover:scale-105"
            >
              {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => inputRef.current?.click()}>Change photo</DropdownMenuItem>
            {preview && (
              <DropdownMenuItem variant="destructive" onSelect={handleRemove}>
                <Trash2 className="size-4" />
                Remove photo
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <ImageCropDialog
        open={cropOpen}
        onOpenChange={setCropOpen}
        imageSrc={rawImage}
        aspect={1}
        cropShape="round"
        isSaving={isPending}
        onSave={handleSave}
      />
    </>
  );
}