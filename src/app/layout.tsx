import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://modelmarketim.com'),
  title: {
    default: 'Modelmarketim | 3D Baskı Figür & Model Mağazası',
    template: '%s | Modelmarketim',
  },
  description:
    'Türkiye\'nin 3D baskı figür mağazası. Özel tasarım 3D baskı figürler, modeller, araç gereçler ve koleksiyon ürünleri. Hızlı kargo, güvenli alışveriş.',
  keywords: [
    '3d baskı figür',
    '3d model',
    '3d yazıcı figür',
    'özel figür',
    '3d baskı türkiye',
    'figür satın al',
    'koleksiyon figür',
    'el yapımı figür',
    '3d tarayıcı',
    '3d baskı araç gereç',
    'pla figür',
    'petg model',
    '3d print figür',
    'modelmarketim',
  ],
  authors: [{ name: 'Modelmarketim', url: 'https://modelmarketim.com' }],
  creator: 'Modelmarketim',
  publisher: 'Modelmarketim',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    alternateLocale: 'en_US',
    url: 'https://modelmarketim.com',
    siteName: 'Modelmarketim',
    title: 'Modelmarketim | 3D Baskı Figür & Model Mağazası',
    description:
      'Türkiye\'nin 3D baskı figür mağazası. Özel tasarım 3D baskı figürler, modeller ve koleksiyon ürünleri.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Modelmarketim — 3D Baskı Figürler',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Modelmarketim | 3D Baskı Figür & Model Mağazası',
    description: 'Özel tasarım 3D baskı figürler ve modeller. Hızlı kargo, güvenli alışveriş.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
  alternates: {
    canonical: 'https://modelmarketim.com',
    languages: {
      'tr': 'https://modelmarketim.com/tr',
      'en': 'https://modelmarketim.com/en',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
