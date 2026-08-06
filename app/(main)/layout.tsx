import Header from "@/components/layout/Header/Header";

function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="">
            <Header />
            <main className="">
                {children}
            </main>
        </div>
    );
}

export default MainLayout;