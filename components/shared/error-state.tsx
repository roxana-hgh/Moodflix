import type { ReactNode } from "react";

type ErrorStateProps = {
  code: string;
  title: string;
  description: string;
  footnote?: string;
  children?: ReactNode;
};

export function ErrorState({
  code,
  title,
  description,
  footnote,
  children,
}: ErrorStateProps) {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6">
      {/* soft glow behind the code */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--primary)_15%,transparent),transparent_70%)]"
      />

      <div className="flex max-w-md flex-col items-center text-center">
        <p
          aria-hidden
          className="select-none bg-linear-to-b from-foreground/40 to-transparent bg-clip-text text-8xl font-semibold tracking-tighter text-transparent sm:text-9xl"
        >
          {code}
        </p>

        <h1 className=" text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-balance text-sm text-muted-foreground">
          {description}
        </p>

        {children && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {children}
          </div>
        )}

        {footnote && (
          <p className="mt-8 font-mono text-xs text-muted-foreground/60">
            {footnote}
          </p>
        )}
      </div>
    </section>
  );
}