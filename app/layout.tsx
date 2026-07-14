import type { Metadata } from 'next';
import { Bebas_Neue, Libre_Franklin } from 'next/font/google';
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${body.variable} font-cuerpo fondo-telon min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
