import { Suspense } from "react";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { ViewerLibrarySeed } from "@/features/lists/components/viewer-library-seed";
import { InstallPrompt } from "@/features/pwa/components/install-prompt";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <InstallPrompt />
      <main className="min-h-screen pt-[var(--header-height)]">{children}</main>
      <Footer />
      {/* The only per-user part of the layout; streams in after the cached shell. */}
      <Suspense fallback={null}>
        <ViewerLibrarySeed />
      </Suspense>
    </>
  );
}
