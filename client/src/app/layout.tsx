import type { Metadata } from "next";
import { QueryProvider } from "@/lib/query-client";
import "./globals.css";

export const metadata: Metadata = {
  title: "BOD Service Portal",
  description: "Recruitment platform for employers and recruitment partners",
  keywords: ["recruitment", "jobs", "hiring", "candidates", "employers"],
  authors: [{ name: "BOD Service Portal" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
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
