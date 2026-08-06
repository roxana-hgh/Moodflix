import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Moodflix",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark h-full", roboto.variable)}
      suppressHydrationWarning
    >
      <body
        className={cn("min-h-screen font-sans antialiased")}
        suppressHydrationWarning
      >
       
        {children}
      </body>
    </html>
  );
}