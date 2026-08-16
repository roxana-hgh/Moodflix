import Link from "next/link";


export function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="">
            <div className="container mx-auto">
                <div className="flex justify-end min-h-dvh items-center">
                    <div className="border rounded-xl p-3 sm:p-5 w-full lg:max-w-[420px] bg-foreground/3 backdrop-blur">
                       <div className="flex flex-col items-center">
                         <Link href="/" className="text-primary text-center font-bold text-lg shrink-0">
                            MOODFLIX
                        </Link>
                        {children}
                       </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;