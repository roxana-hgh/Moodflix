import Image from "next/image";
import Link from "next/link";
import HeroImg from "@/assets/imgs/hero3.png"

export function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="relative">
            <div className="fixed inset-0 -z-2"> <Image src={HeroImg} alt="MoodFlix" className="block -scale-x-100 object-cover aspect-16/8 w-full h-full" /></div>
            <div className="fixed inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/40 -z-1"> </div>
            <div className="container mx-auto">
                <div className="flex justify-end min-h-dvh items-center">
                    <div className="border rounded-xl p-4 sm:p-5 w-full lg:max-w-[460px] bg-foreground/3 backdrop-blur-lg">
                        <div className="flex flex-col items-center">
                            <Link href="/" className="text-primary text-center font-bold text-lg lg:text-xl shrink-0">
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