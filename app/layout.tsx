import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Walrus Memory Agent",
  description:
    "An AI chat agent with persistent, user-owned memory backed by Walrus Memory.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
