import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";

function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="">
            <Header />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer />
        </div>
    );
}

export default MainLayout;