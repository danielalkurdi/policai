import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';
import { BackToTop } from '@/components/ui/back-to-top';

export const metadata: Metadata = {
  title: 'Policai - Australian AI Policy Tracker',
  description:
    'Track and visualise Australian AI policy and regulation developments across federal and state jurisdictions.',
  keywords: [
    'Australian AI policy',
    'AI regulation',
    'artificial intelligence',
    'government policy',
    'AI ethics',
    'DTA AI Policy',
    'AI transparency',
    'AI governance Australia',
  ],
  authors: [{ name: 'Policai Team' }],
  creator: 'Policai',
  publisher: 'Policai',
  metadataBase: new URL('https://policai.com.au'),
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://policai.com.au',
    title: 'Policai - Australian AI Policy Tracker',
    description:
      'Track and visualise Australian AI policy and regulation developments across federal and state jurisdictions.',
    siteName: 'Policai',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Policai - Australian AI Policy Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Policai - Australian AI Policy Tracker',
    description:
      'Track and visualise Australian AI policy and regulation developments across federal and state jurisdictions.',
    images: ['/og-image.png'],
    creator: '@policai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <body
        className="antialiased min-h-screen flex flex-col"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <BackToTop />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
