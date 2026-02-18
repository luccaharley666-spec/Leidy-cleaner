import './globals.css';
import React from 'react';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Limpar Plus - Limpeza Profissional & Confiável',
  description: 'Serviços de limpeza profissional para residências e empresas. Agende agora mesmo!',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
