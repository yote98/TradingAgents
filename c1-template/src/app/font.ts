import {
  Inter,
  Roboto,
  Geist,
  Geist_Mono,
} from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-roboto",
});

export const geist = Geist({
  subsets: ["latin"],
  style: ["normal"],
  display: "swap",
  variable: "--font-geist",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  style: ["normal"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const fonts = [
  inter,
  roboto,
  geist,
  geistMono,
];
