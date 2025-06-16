import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NixR Admin - Central Brain",
  description: "Admin dashboard for managing NixR recovery platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
