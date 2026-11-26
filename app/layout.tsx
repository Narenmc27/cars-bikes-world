import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "../components/SmoothScroll";
import LiquidBackground from "../components/LiquidBackground";
import LiquidCursor from "../components/LiquidCursor";
import GarageChat from "../components/GarageChat";

export const metadata: Metadata = {
  metadataBase: new URL("https://cars-bikes-world.vercel.app"),
  title: {
    default: "Cars & Bikes World",
    template: "%s | Cars & Bikes World",
  },
  description: "A fluid encyclopedia of every car and bike ever made.",
  openGraph: {
    title: "Cars & Bikes World",
    description: "A fluid encyclopedia of every car and bike ever made.",
    siteName: "Cars & Bikes World",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SmoothScroll>
          <LiquidBackground />
          <LiquidCursor />
          {children}
          <GarageChat />
        </SmoothScroll>
      </body>
    </html>
  );
}