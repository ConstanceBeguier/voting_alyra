import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import ContextProvider from "@/context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Aurora } from "@/components/Aurora";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voting",
  description: "On-chain voting dApp",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // wagmi rehydrates from this, so server and client agree on the connection
  const cookies = (await headers()).get("cookie");

  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col bg-background font-sans text-foreground">
        <Aurora />
        <ContextProvider cookies={cookies}>
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">{children}</main>
          <Footer />
        </ContextProvider>
      </body>
    </html>
  );
}
