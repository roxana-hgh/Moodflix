// features/profile/components/banner-upload.tsx
"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { uploadBanner, removeBanner, removeAvatar, uploadAvatar } from "../actions";
import { ImageCropDialog } from "./image-crop-dialog";

interface BannerUploadProps {
  bannerUrl: string | null;
}

export function BannerUpload({ bannerUrl }: BannerUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(bannerUrl);
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

  // AvatarUpload / BannerUpload — handleSave
function handleSave(blob: Blob) {
  startTransition(async () => {
    const formData = new FormData();
    formData.append("file", blob, "banner.webp");
    const result = await uploadBanner(formData);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setPreview(result.data!.url);
    setCropOpen(false);
    toast.success("banner updated");
  });
}
  function handleRemove() {
  startTransition(async () => {
    const result = await removeBanner();
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setPreview(null);
    toast.success("banner removed");
  });
}

  return (
    <>
      <div className="group relative h-32 w-full overflow-hidden rounded-xl sm:h-46">
        {preview ? (
          <Image src={preview} alt="Cover" fill className="object-cover" priority />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/30 via-primary/10 to-background" />
        )}

        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={isPending}
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium opacity-0 shadow backdrop-blur transition-opacity group-hover:opacity-100 sm:opacity-100"
            >
              {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
              Edit cover
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => inputRef.current?.click()}>Change cover</DropdownMenuItem>
            {preview && (
              <DropdownMenuItem variant="destructive" onSelect={handleRemove}>
                <Trash2 className="size-4" />
                Remove cover
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
        aspect={4 / 1}
        cropShape="rect"
        isSaving={isPending}
        onSave={handleSave}
      />
    </>
  );
}