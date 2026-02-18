"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import React from 'react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold">
            ✨ Limpar Plus
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-blue-100 transition">Home</Link>
            <Link href="/services" className="hover:text-blue-100 transition">Serviços</Link>

            {isAuthenticated ? (
              <>
                <Link href="/bookings" className="hover:text-blue-100 transition">Meus Agendamentos</Link>

                {user?.role === 'admin' && (
                  <Link href="/admin" className="hover:text-blue-100 transition font-semibold">Admin</Link>
                )}

                <div className="relative group">
                  <button className="hover:text-blue-100 transition flex items-center space-x-1">
                    <span>{user?.name || user?.email}</span>
                    <span>▼</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg hidden group-hover:block">
                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">Perfil</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">Logout</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hover:text-blue-100 transition">Login</Link>
                <Link href="/auth/register" className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition">Registrar</Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white text-2xl">☰</button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block py-2 hover:text-blue-100">Home</Link>
            <Link href="/services" className="block py-2 hover:text-blue-100">Serviços</Link>
            {isAuthenticated ? (
              <>
                <Link href="/bookings" className="block py-2 hover:text-blue-100">Meus Agendamentos</Link>
                {user?.role === 'admin' && <Link href="/admin" className="block py-2 hover:text-blue-100 font-semibold">Admin</Link>}
                <button onClick={handleLogout} className="block w-full text-left py-2 text-red-400 hover:text-red-300">Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block py-2 hover:text-blue-100">Login</Link>
                <Link href="/auth/register" className="block py-2 hover:text-blue-100">Registrar</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
