"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Share, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { INSTALL_PROMPT_READY_EVENT } from "@/features/pwa/capture-install-prompt";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

declare global {
  interface Window {
    __moodflixInstallPrompt?: BeforeInstallPromptEvent;
  }
  interface Navigator {
    standalone?: boolean;
  }
}

// "native" browsers fire beforeinstallprompt; the others only install from their own UI.
type InstallPlatform = "native" | "ios" | "macos-safari" | "firefox-android";

const SEEN_KEY = "moodflix:install-prompt-seen";
const SHOW_DELAY_MS = 2000;
const AUTO_CLOSE_MS = 15000;
// Matches duration-300 on the banner.
const EXIT_DURATION_MS = 300;

function hasSeenPrompt() {
  try {
    return localStorage.getItem(SEEN_KEY) !== null;
  } catch {
    // Storage is blocked, so "seen" can't be remembered: stay quiet rather than show it on every visit.
    return true;
  }
}

function markPromptSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {}
}

function isInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}

function getManualPlatform(): InstallPlatform | null {
  const ua = navigator.userAgent;

  // iPadOS reports a Mac user agent, so touch support tells them apart.
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) {
    return "ios";
  }

  // Add to Dock arrived in Safari 17.
  const safariVersion = /Macintosh/.test(ua) ? ua.match(/Version\/(\d+).*Safari/)?.[1] : undefined;
  if (safariVersion && Number(safariVersion) >= 17) return "macos-safari";

  if (/Android.*Firefox/.test(ua)) return "firefox-android";

  return null;
}

function Instructions({ platform }: { platform: InstallPlatform }) {
  switch (platform) {
    case "ios":
      return (
        <>
          Tap <Share className="inline size-3.5 align-text-top text-primary" aria-label="Share" /> then{" "}
          <span className="font-medium text-foreground">Add to Home Screen</span>.
        </>
      );
    case "macos-safari":
      return (
        <>
          Open the <span className="font-medium text-foreground">File</span> menu, then choose{" "}
          <span className="font-medium text-foreground">Add to Dock</span>.
        </>
      );
    case "firefox-android":
      return <>Open the browser menu and add the app to your Home screen.</>;
    case "native":
      return <>Get quick, full-screen access right from your device.</>;
  }
}

export function InstallPrompt() {
  const [platform, setPlatform] = useState<InstallPlatform | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (hasSeenPrompt() || isInstalled()) return;

    let showTimer: ReturnType<typeof setTimeout>;
    const scheduleShow = (next: InstallPlatform) => {
      showTimer = setTimeout(() => {
        markPromptSeen();
        setPlatform(next);
      }, SHOW_DELAY_MS);
    };
    const onPromptReady = () => scheduleShow("native");

    const manualPlatform = getManualPlatform();
    if (manualPlatform) {
      scheduleShow(manualPlatform);
    } else if (window.__moodflixInstallPrompt) {
      onPromptReady();
    } else {
      window.addEventListener(INSTALL_PROMPT_READY_EVENT, onPromptReady, { once: true });
    }

    return () => {
      clearTimeout(showTimer);
      window.removeEventListener(INSTALL_PROMPT_READY_EVENT, onPromptReady);
    };
  }, []);

  useEffect(() => {
    if (!platform) return;

    const close = () => setIsClosing(true);
    const autoCloseTimer = setTimeout(close, AUTO_CLOSE_MS);
    window.addEventListener("appinstalled", close);

    return () => {
      clearTimeout(autoCloseTimer);
      window.removeEventListener("appinstalled", close);
    };
  }, [platform]);

  useEffect(() => {
    if (!isClosing) return;

    const exitTimer = setTimeout(() => setPlatform(null), EXIT_DURATION_MS);
    return () => clearTimeout(exitTimer);
  }, [isClosing]);

  if (!platform) return null;

  const install = () => {
    setIsClosing(true);
    window.__moodflixInstallPrompt?.prompt();
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(var(--header-height)+0.5rem)] z-40 flex justify-center px-4">
      <div
        role="region"
        aria-label="Install Moodflix"
        className={cn(
          "pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border bg-popover/85 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl duration-300 motion-reduce:animate-none",
          isClosing
            ? "animate-out fade-out slide-out-to-top-full fill-mode-forwards ease-in"
            : "animate-in fade-in slide-in-from-top-full ease-out"
        )}
      >
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={44}
          height={44}
          unoptimized
          className="size-11 shrink-0 rounded-xl"
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-popover-foreground">Install Moodflix</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            <Instructions platform={platform} />
          </p>
        </div>

        {platform === "native" && (
          <Button size="sm" className="shrink-0 rounded-full" onClick={install}>
            <Download />
            Install
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 rounded-full text-muted-foreground"
          onClick={() => setIsClosing(true)}
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
