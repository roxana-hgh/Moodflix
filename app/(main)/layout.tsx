import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import { InstallPrompt } from "@/features/pwa/components/install-prompt";

function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <InstallPrompt />
            <main className="min-h-screen pt-[var(--header-height)]">
                {children}
            </main>
            <Footer />
        </>
    );
}

export default MainLayout;