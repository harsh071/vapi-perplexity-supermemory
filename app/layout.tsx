import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vapi Next.js Integration",
  description: "Voice AI integration with Next.js using Vapi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
