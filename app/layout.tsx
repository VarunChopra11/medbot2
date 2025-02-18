import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

import { cn } from "@/utils";
import { Poppins } from "next/font/google";

export const metadata: Metadata = {
  title: "My AI Therapist",
  description: "AI Therapist for everyone",
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Choose weights as needed
  variable: "--font-poppins", // Use CSS variable
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <link
          rel="icon"
          href="https://res.cloudinary.com/dz1iib5rr/image/upload/v1738334727/Screenshot_2025-01-31_201107-removebg-preview_p6jfjk.png"
          sizes="any"
        />
      </head>
      <body
        className={cn(GeistSans.variable, GeistMono.variable, " font-poppins")}
      >
        {children}
      </body>
    </html>
  );
}
