import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, EB_Garamond } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import {ModeToggle} from "@/components/ui/mode-toggle";

const ebGaramondHeading = EB_Garamond({subsets:['latin'],variable:'--font-heading'});

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI-Powered CSV Sanitizer",
  description: "Effortlessly import, map, and sanitize your CRM leads using AI. Automatically clean, deduplicate, and validate contact details in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en" suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", notoSans.variable, ebGaramondHeading.variable)}
    >
      <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50 bg-grid-spreadsheet">
        {/* Sticky Glassmorphic Header */}
        <header className="sticky top-0 z-50 w-full border-b border-neutral-200/50 bg-white/75 backdrop-blur-md dark:border-neutral-800/50 dark:bg-neutral-950/75">
          <div className="flex h-16 w-full max-w-none items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                <Image
                  src="/groweasy_ai_logo.jpg"
                  alt="GrowEasy AI Logo"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover scale-115"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                  CSV Sanitizer
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  GrowEasy
                </span>
              </div>
            </div>
            
            {/* Right side controls/badge */}
            <div className="flex items-center gap-4">
              <ModeToggle />
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                Active System
              </span>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex flex-1 flex-col">
          {children}
        </main>
      </body>
      </ThemeProvider>
    </html>
  );
}
