import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper";
import OnboardingCarousel from "@/components/onboarding/OnboardingCarousel";
import A2HSBanner from "@/components/pwa/A2HSBanner";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Introduction to Islam — Student Portal",
  description: "Your free Islamic learning portal — self-paced courses, live Zoom classes, and private consultations.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "IntroToIslam",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#E81C74",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-800 antialiased min-h-screen flex flex-col`}>
        <SessionProviderWrapper>
          <OfflineBanner />
          <Navbar />
          <div className="flex-grow">{children}</div>
          <Footer />
          <OnboardingCarousel />
          <A2HSBanner />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
