import type { Metadata, Viewport } from 'next';
import './globals.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: 'Personal Recipe Book',
  description: 'A private PWA recipe book for photo-based recipes.',
  manifest: `${basePath}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    title: 'Recipes',
    statusBarStyle: 'default'
  },
  icons: {
    icon: `${basePath}/icons/icon-192.svg`,
    apple: `${basePath}/icons/icon-192.svg`
  }
};

export const viewport: Viewport = {
  themeColor: '#fff8ef',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
