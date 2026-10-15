import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { PageTransition } from "@/components/providers/page-transition";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Workspace ERP | Enterprise Project & Resource Operations",
  description: "Next-generation ERP platform featuring Liquid Glass interface, CRM, real-time Kanban, asset versioning, and financial billing pipelines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#f8fafc] text-slate-900 antialiased selection:bg-indigo-600 selection:text-white`}
      >
        <AuthProvider>
          <QueryProvider>
            <PageTransition>{children}</PageTransition>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
