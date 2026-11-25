import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "../components/SmoothScroll";
import LiquidBackground from "../components/LiquidBackground";
import LiquidCursor from "../components/LiquidCursor";

export const metadata: Metadata = {
  title: "Cars & Bikes World",
  description: "A fluid encyclopedia of every car and bike ever made.",
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
        </SmoothScroll>
      </body>
    </html>
  );
}