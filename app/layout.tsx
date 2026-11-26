import type { Metadata } from "next";
import { Alfa_Slab_One, Courier_Prime } from "next/font/google";
import "./globals.css";
import SmoothScroll from "../components/SmoothScroll";
import GarageChat from "../components/GarageChat";

const alfa = Alfa_Slab_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-alfa",
});

const courier = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-courier",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cars-bikes-world.vercel.app"),
  title: {
    default: "Cars & Bikes World",
    template: "%s | Cars & Bikes World",
  },
  description: "A vintage garage encyclopedia of famous cars and bikes.",
  openGraph: {
    title: "Cars & Bikes World",
    description: "A vintage garage encyclopedia of famous cars and bikes.",
    siteName: "Cars & Bikes World",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${alfa.variable} ${courier.variable}`}>
      <body className="font-body antialiased">
        <SmoothScroll>
          {children}
          <GarageChat />
        </SmoothScroll>
      </body>
    </html>
  );
}