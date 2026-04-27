import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Battle Sums - Fun Math Game for Kids',
  description: 'Sharpen your arithmetic skills with Battle Sums! A fun and engaging math game for all ages, featuring Challenge Mode, Free Play, Time Trials, and the strategic Math Ships game.',
  keywords: ['math game', 'arithmetic', 'education', 'kids math', 'learning game', 'addition', 'subtraction', 'multiplication', 'division'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased h-full">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
