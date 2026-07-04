import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MessagingProvider } from "@/context/MessagingContext";
import { Header } from "@/components/Header";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { LoadingScreen } from "@/components/LoadingScreen"; // Fixed import
import { ChatBox } from "@/components/ChatBox";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "MyLinkedIn - Professional Networking Platform",
    template: "%s | MyLinkedIn",
  },
  description:
    "Connect with industry leaders, share your expertise, and discover opportunities that shape your career journey.",
  keywords: [
    "professional networking",
    "career development",
    "industry connections",
    "job opportunities",
  ],
  authors: [{ name: "MyLinkedIn Team" }],
  creator: "MyLinkedIn",
  metadataBase: new URL("https://mylinkedin-platform.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mylinkedin-platform.vercel.app",
    title: "MyLinkedIn - Professional Networking Platform",
    description:
      "Connect with industry leaders, share your expertise, and discover opportunities that shape your career journey.",
    siteName: "MyLinkedIn",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyLinkedIn - Professional Networking Platform",
    description:
      "Connect with industry leaders, share your expertise, and discover opportunities.",
    creator: "@mylinkedin",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<LoadingScreen />}>
            <SmoothScrollProvider>
              <AuthProvider>
                <MessagingProvider>
                  <Header />
                  <main className="min-h-screen">{children}</main>
                  <ChatBox />
                </MessagingProvider>
              </AuthProvider>
            </SmoothScrollProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
