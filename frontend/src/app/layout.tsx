import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import ContextProvider from "@/context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
  // wagmi rehydrates its state from the cookie, so the server and the client
  // start from the same connection state
  const cookies = (await headers()).get("cookie");

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ContextProvider cookies={cookies}>
          <Header />
          <main className="flex-1 px-6 py-8">{children}</main>
          <Footer />
        </ContextProvider>
      </body>
    </html>
  );
}
