import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { tmdbImageUrl } from "@/utils/image";

type Props = {
  href?: string;
  imagePath: string | null;
  imageAlt: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

const SIZES = "(min-width:1280px) 12vw, (min-width:1024px) 16vw, (min-width:640px) 25vw, 45vw";

export function PortraitTile({ href, imagePath, imageAlt, title, subtitle, action }: Props) {
  const body = (
    <>
      {imagePath ? (
        <Image
          src={tmdbImageUrl(imagePath)}
          alt={imageAlt}
          fill
          sizes={SIZES}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-xl font-semibold text-muted-foreground">
          {title.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-2.5 pb-2.5 pt-12">
        <p className="line-clamp-2 text-sm font-semibold leading-tight text-white">{title}</p>
        {subtitle && <p className="mt-0.5 truncate text-xs text-white/70">{subtitle}</p>}
      </div>
    </>
  );

  return (
    <div className="group relative aspect-[2/3] overflow-hidden rounded-xl border border-border/60 bg-muted">
      {href ? (
        <Link href={href} className="absolute inset-0 block">
          {body}
        </Link>
      ) : (
        body
      )}
      {action && <div className="absolute right-2 top-2 z-10">{action}</div>}
    </div>
  );
}