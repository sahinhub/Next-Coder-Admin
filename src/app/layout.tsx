import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/providers/toast-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: false,
  // Optimize font loading
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false, // Don't preload secondary font
  fallback: ['monospace'],
  adjustFontFallback: false,
  // Only load weights we actually use
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: "Next Coder Admin Dashboard",
  description: "Manage portfolios, testimonials, careers and more for We Next Coder",
  keywords: "admin dashboard, portfolio management, testimonial management, career management, We Next Coder",
  authors: [{ name: "We Next Coder" }],
  creator: "We Next Coder",
  publisher: "We Next Coder",
  // Performance optimizations
  robots: {
    index: false, // Admin panel shouldn't be indexed
    follow: false,
  },
  // Preload critical resources
  other: {
    'preload': '/We-Next-Coder.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/We-Next-Coder.png" type="image/png" />
        <link rel="icon" href="/We-Next-Coder.png" sizes="any" />
        {/* Critical resource hints for LCP optimization */}
        <link rel="preload" href="/We-Next-Coder.png" as="image" type="image/png" fetchPriority="high" />
        <link rel="dns-prefetch" href="https://nextcoderapi.vercel.app" />
        <link rel="preconnect" href="https://nextcoderapi.vercel.app" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        {/* Remove API preloads as they're not critical for LCP */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        {/* Critical CSS inline for faster rendering - optimized */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
            .loading-skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
            @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            .dark .loading-skeleton { background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%); background-size: 200% 100%; }
            /* Critical above-the-fold styles */
            .admin-layout { min-height: 100vh; display: flex; }
            .admin-sidebar { width: 250px; background: #f8fafc; }
            .admin-content { flex: 1; padding: 1rem; }
            /* Optimize for LCP */
            .dashboard-header { background: linear-gradient(135deg, #10b981, #3b82f6); }
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
