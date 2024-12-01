import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import TRPCProvider from "../trpc/Provider";  // Corrected import
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "DIONYSUS",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body>
          {/* Wrap with TRPCProvider here */}
          <TRPCProvider>{children}</TRPCProvider>
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
