import type { Metadata, Viewport } from "next";
import { QueryProvider } from "@/lib/query-client";
import "./globals.css";

export const metadata: Metadata = {
  title: "CIERO",
  description: "Recruitment platform for employers and recruitment partners",
  keywords: ["recruitment", "jobs", "hiring", "candidates", "employers"],
  authors: [{ name: "CIERO" }],
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
      <body className="antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
