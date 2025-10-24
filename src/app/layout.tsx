import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://calendr.layground.com'),
  title: 'Calendr - Public Holidays & Regional Events',
  description: 'Discover public holidays and regional events across different countries and regions.',
  keywords: 'calendar, events, public holidays, regional events, tourism',
  openGraph: {
    title: 'Calendr - Public Holidays & Regional Events',
    description: 'Discover public holidays and regional events across different countries and regions.',
    url: 'https://calendr.layground.com',
    siteName: 'Calendr',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Calendr - Public Holidays & Regional Events',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calendr - Public Holidays & Regional Events',
    description: 'Discover public holidays and regional events across different countries and regions.',
    creator: '@layground',
    images: ['/og-image.png'],
  },
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
        className={`font-sans bg-white text-gray-900 antialiased dark:bg-slate-900 dark:text-slate-200`}
      >
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">{children}</main>
        </div>
      </body>
    </html>
  );
}
