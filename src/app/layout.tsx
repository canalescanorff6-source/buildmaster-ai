import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { RegisterServiceWorker } from '@/components/RegisterServiceWorker';
import './globals.css';

export const metadata: Metadata = {
<<<<<<< HEAD
  title: 'BuildMaster Elite Tático v25',
  description: 'App premium privado com Leitor Elite de Carta, Central de Precisão Manual, guia tático, variações de formação e ficha focada em desempenho real em campo. Versão preparada para APK Android.',
=======
  title: 'BuildMaster Elite Tático v24',
  description: 'App premium privado com Leitor Elite de Carta, Central de Precisão Manual, guia tático, variações de formação e ficha focada em desempenho real em campo, sem IA paga.',
>>>>>>> c6c88af0748f1d196664c43bfafc67441e91c32e
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'BuildMaster Elite Tático',
    statusBarStyle: 'black-translucent'
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }]
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#020712'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body><RegisterServiceWorker />{children}</body>
    </html>
  );
}
