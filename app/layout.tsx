import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, Libre_Franklin } from 'next/font/google';
import RegistradorPWA from '@/components/RegistradorPWA';
import './globals.css';

const display = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
});

const body = Libre_Franklin({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Portal de Negocios | EL ARENALENSE',
  description: 'Descubre los negocios de la zona, presentados como en la marquesina de un cine.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'El Arenalense',
  },
};

// Controla cómo se ajusta la página a cada pantalla (celular, tablet, PC) y
// el color de la barra del navegador / status bar cuando está instalada.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1E120B',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${body.variable} font-cuerpo fondo-telon min-h-screen`}>
        <RegistradorPWA />
        {children}
      </body>
    </html>
  );
}
