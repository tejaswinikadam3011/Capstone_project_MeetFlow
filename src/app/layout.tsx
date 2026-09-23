import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MeetFlow — AI-Powered Meeting Platform for Colleges",
  description: "MeetFlow brings AI-powered meeting management, smart summaries, task tracking, and Q&A assistance to college classrooms and teams.",
  keywords: "meeting platform, AI meetings, college collaboration, video conferencing, smart summaries",
  openGraph: {
    title: "MeetFlow",
    description: "AI-powered meeting platform for colleges",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased selection:bg-purple-500/30 selection:text-white">
        {/* Fine Star Dust Noise Grain */}
        <div className="stardust-bg" />

        {/* Top & Bottom Glowing Violet Arches (Exact Reference Layout) */}
        <div className="violet-arch-top" />
        <div className="violet-arch-bottom" />

        {/* Foreground Page Content */}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
