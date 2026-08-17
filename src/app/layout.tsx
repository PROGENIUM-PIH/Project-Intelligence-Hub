import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const skodaNext = localFont({
  src: [
    {
      path: "../fonts/SKODANext-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/SKODANext-Regular.ttf",
      weight: "400 700",
      style: "normal",
    },
    {
      path: "../fonts/SKODANext-Black.ttf",
      weight: "800 900",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Intelligence Hub",
  description:
    "Program management hub for the global automotive sales transformation initiative.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${skodaNext.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
