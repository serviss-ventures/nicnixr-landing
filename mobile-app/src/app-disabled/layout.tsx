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
  title: "NixR - Your Journey to a Addiction-Free Life Starts Here",
  description: "Break free from addiction with NixR. The science-backed mobile app that helps you quit smoking and vaping for good. Track your progress, stay motivated, and join thousands who've successfully quit.",
  keywords: ["quit smoking", "stop vaping", "addiction recovery", "NixR", "nicotine free", "health app"],
  authors: [{ name: "NixR Team" }],
  openGraph: {
    title: "NixR - Your Journey to a Addiction-Free Life",
    description: "Break free from addiction with science-backed support, tracking, and community.",
    url: "https://nixr.com",
    siteName: "NixR",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NixR - Your Journey to a Addiction-Free Life",
    description: "Break free from addiction with science-backed support.",
    images: ["/og-image.jpg"],
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
