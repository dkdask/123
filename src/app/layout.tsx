import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "NeuroTune - EEG로 찾는 나만의 음악 취향",
  description: "Personalized music recommendations powered by EEG brain analysis. Discover music that resonates with your cognitive state.",
  keywords: ["music", "EEG", "brain", "recommendations", "personalized", "neuroscience"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#E8E8E8] text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
