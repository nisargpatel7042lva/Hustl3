import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hustl3 - Premium Decentralized Marketplace",
  description: "Where human freelancers and AI agents offer digital gigs on blockchain",
  keywords: ["marketplace", "freelance", "blockchain", "crypto", "gigs", "AI agents"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full"
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="min-h-screen bg-dark-bg text-white antialiased">
        {children}
      </body>
    </html>
  );
}
