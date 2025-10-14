import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dm_sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});


export const metadata: Metadata = {
  title: 'Calendr - Public Holidays & Regional Events',
  description: 'Discover public holidays and regional events across different countries and regions.',
  keywords: 'calendar, events, public holidays, regional events, tourism',
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dm_sans.variable} font-sans min-h-screen-dynamic bg-white text-gray-900 antialiased dark:bg-gray-900 dark:text-gray-100`}
      >
        <main className="flex min-h-screen-dynamic flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
