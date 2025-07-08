import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import NetworkStatus from "@/components/NetworkStatus";
import ConvexClientProvider from "./ConvexClientProvider";
import dynamic from "next/dynamic";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const OfflineBanner = dynamic(() => import("../components/OfflineBanner"), { ssr: false });
const InstallPWAButton = dynamic(() => import("../components/InstallPWAButton"), { ssr: false });
const OfflineSyncProvider = dynamic(() => import("../components/OfflineSyncProvider"), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

// PWA metadata
export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track your expenses with ease",
  generator: 'Next.js',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Expense Tracker',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Expense Tracker',
    title: 'Expense Tracker - Track Your Expenses',
    description: 'A simple and effective way to track your expenses',
  },
  twitter: {
    card: 'summary',
    title: 'Expense Tracker',
    description: 'Track your expenses with ease',
  },
};

// PWA viewport configuration
export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
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
          <Toaster position="bottom-center" />
          <NetworkStatus />
          <ServiceWorkerRegistration />
        </ConvexClientProvider>
      </body>
    </html>
  );
}

