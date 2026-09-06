import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const { data: roles } = await supabase
    .from('user_roles')
    .select('*')
    .order('created_at', { ascending: false });

  // Known users metadata helper or defaults
  const userList = [
    {
      id: 'eaf46b0d-1fad-4c01-8a32-c8dce86f2814',
      name: 'Alejandro Molano',
      email: 'molanolozanoalejandro@gmail.com',
      role: 'admin',
      avatar: 'https://avatars.githubusercontent.com/u/69174170?v=4',
      provider: 'GitHub (AlejandroMolanoL)',
      status: 'Activo',
      created_at: '2026-09-05',
    },
    {
      id: 'faf2eb0c-faf4-43e2-86d9-cfee6d97a0ec',
      name: 'Alejandro Molano',
      email: 'esteropes1@gmail.com',
      role: 'user',
      avatar: 'https://lh3.googleusercontent.com/a/ACg8ocI1FSXGKY8pht6PMulcLKLUGHAxh7FWm5iR2E3ISEEgSI0RJW8=s96-c',
      provider: 'Google',
      status: 'Activo',
      created_at: '2026-09-05',
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-nordic tracking-tight">
            Directorio de Usuarios
          </h1>
          <p className="text-nordic/60 text-sm mt-1">
            Gestiona los accesos y roles del personal en la plataforma.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/propiedades"
            className="bg-white border border-nordic/15 text-nordic hover:bg-black/5 px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <span className="material-icons text-base text-mosque">apartment</span>
            <span>Ver Propiedades</span>
          </Link>
        </div>
      </div>

      {/* User Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {userList.map((usr) => (
          <div
            key={usr.id}
            className="bg-white rounded-xl border border-nordic/10 p-6 shadow-sm hover:shadow-soft transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={usr.avatar}
                  alt={usr.name}
                  className="w-14 h-14 rounded-full object-cover border border-nordic/10 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-nordic">{usr.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        usr.role === 'admin'
                          ? 'bg-mosque text-white'
                          : 'bg-gray-100 text-nordic/70'
                      }`}
                    >
                      {usr.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </div>
                  <p className="text-xs text-nordic/60 mt-0.5">{usr.email}</p>
                  <p className="text-[11px] text-nordic/40 mt-1 flex items-center gap-1">
                    <span className="material-icons text-xs text-mosque">verified_user</span>
                    <span>Conectado vía {usr.provider}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-nordic/60">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-emerald-700">{usr.status}</span>
              </div>
              <div>Registrado: {usr.created_at}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
