import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";

function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <main className="min-h-screen pt-[var(--header-height)]">
                {children}
            </main>
            <Footer />
        </>
    );
}

export default MainLayout;