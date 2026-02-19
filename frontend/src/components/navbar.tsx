import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="w-full bg-white shadow flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-bold text-xl text-blue-700">LimpezaPro</Link>
        <Link href="/servicos" className="text-gray-700 hover:text-blue-700">Serviços</Link>
        {isAuthenticated && (
          <Link href="/meus-agendamentos" className="text-gray-700 hover:text-blue-700">Meus Agendamentos</Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <div className="relative group">
            <button className="flex items-center gap-2 text-gray-700 hover:text-blue-700">
              {user?.name || 'Usuário'}
              <span className="material-icons">expand_more</span>
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg hidden group-hover:block z-10">
              <Link href="/perfil" className="block px-4 py-2 hover:bg-gray-100">Perfil</Link>
              <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Sair</button>
            </div>
          </div>
        ) : (
          <>
            <Link href="/auth/login" className="text-gray-700 hover:text-blue-700">Entrar</Link>
            <Link href="/auth/register" className="text-gray-700 hover:text-blue-700">Cadastrar</Link>
          </>
        )}
      </div>
    </nav>
  );
}
