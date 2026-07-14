'use client';

import { useEffect } from 'react';

/**
 * Registra el service worker en segundo plano. No renderiza nada visible:
 * solo habilita que el sitio se pueda instalar como PWA y funcione con
 * un mínimo de resiliencia sin conexión.
 */
export default function RegistradorPWA() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Si falla el registro (por ejemplo en desarrollo local sin https),
      // el sitio sigue funcionando normal, solo sin capacidades de PWA.
    });
  }, []);

  return null;
}
