import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NicNixr - Your Journey to a Smoke-Free Life Starts Here",
  description: "Break free from nicotine addiction with NicNixr. The science-backed mobile app that helps you quit smoking and vaping for good. Track your progress, stay motivated, and join thousands who&rsquo;ve successfully quit.",
  keywords: "quit smoking, quit vaping, nicotine addiction, stop smoking app, quit nicotine, smoking cessation, vaping cessation",
  authors: [{ name: "NicNixr Team" }],
  openGraph: {
    title: "NicNixr - Your Journey to a Smoke-Free Life",
    description: "The science-backed mobile app helping thousands quit nicotine for good.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NicNixr - Your Journey to a Smoke-Free Life",
    description: "The science-backed mobile app helping thousands quit nicotine for good.",
  },
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} antialiased bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
