import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import dynamic from "next/dynamic";
const OfflineBanner = dynamic(() => import("../components/OfflineBanner"), { ssr: false });
const InstallPWAButton = dynamic(() => import("../components/InstallPWAButton"), { ssr: false });
const OfflineSyncProvider = dynamic(() => import("../components/OfflineSyncProvider"), { ssr: false });


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "A modern PWA expense tracking app",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-gray-900">
      <body className={inter.className}>
        <ConvexClientProvider>
            <OfflineSyncProvider>
              {children}
            </OfflineSyncProvider>
            <OfflineBanner />
            <InstallPWAButton />
          </ConvexClientProvider>
      </body>
    </html>
  );
}

