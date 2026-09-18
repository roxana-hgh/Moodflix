"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface YoutubeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    videoKey: string | null;
    title: string;
    onPrev?: () => void;
    onNext?: () => void;
    counter?: string;
}

export function YoutubeDialog({
    open,
    onOpenChange,
    videoKey,
    title,
    onPrev,
    onNext,
    counter,
}: YoutubeDialogProps) {
    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

                <DialogPrimitive.Content
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 p-4 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                >
                    <DialogPrimitive.Close className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-2 text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-4 sm:top-4">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>

                    {onPrev && (
                        <button
                            onClick={onPrev}
                            className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20 sm:flex"
                        >
                            <ChevronLeft className="h-6 w-6" />
                            <span className="sr-only">Previous video</span>
                        </button>
                    )}
                    {onNext && (
                        <button
                            onClick={onNext}
                            className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20 sm:flex"
                        >
                            <ChevronRight className="h-6 w-6" />
                            <span className="sr-only">Next video</span>
                        </button>
                    )}

                    <DialogPrimitive.Title className="line-clamp-2 max-w-4xl px-14 text-center text-sm font-medium text-white/90 sm:px-16 sm:text-base">
                        {title}
                    </DialogPrimitive.Title>

                    <div className="relative aspect-video  w-full max-w-5xl overflow-hidden rounded-lg shadow-2xl shadow-black/50">
                        {videoKey && open && (
                            <iframe
                                key={videoKey}
                                src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&controls=1&rel=0&playsinline=1`}
                                title={title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="
                                    absolute inset-0 z-10
                                    h-full w-full
                                    rounded-lg
                                    pointer-events-auto
                                "
                            />
                        )}
                    </div>

                    {counter && <div className="text-xs font-medium text-white/70">{counter}</div>}

                    {(onPrev || onNext) && (
                        <div className="flex items-center gap-5 sm:hidden">
                            {onPrev && (
                                <button
                                    onClick={onPrev}
                                    className="rounded-full bg-white/10 p-2.5 text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                    <span className="sr-only">Previous video</span>
                                </button>
                            )}
                            {onNext && (
                                <button
                                    onClick={onNext}
                                    className="rounded-full bg-white/10 p-2.5 text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                    <span className="sr-only">Next video</span>
                                </button>
                            )}
                        </div>
                    )}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}