import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/app/providers";
import { captureInstallPromptScript } from "@/features/pwa/capture-install-prompt";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Moodflix",
  description: "",
  appleWebApp: {
    capable: true,
    title: "Moodflix",
    statusBarStyle: "black",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark", roboto.variable)}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: captureInstallPromptScript }} />
      </head>
      <body
        className={cn(" font-sans antialiased")}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
       

      </body>
    </html>
  );
}