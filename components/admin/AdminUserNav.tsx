'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export default function AdminUserNav() {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Auth change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await supabase.auth.signOut();
      setUser(null);
      setIsOpen(false);
      router.replace('/login');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Administrador';

  const userEmail = user?.email || 'admin@luxuestate.com';

  const userAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    'https://avatars.githubusercontent.com/u/69174170?v=4';

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {/* Back to main site link */}
      <Link
        href="/"
        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-nordic/15 text-nordic text-xs font-semibold hover:border-mosque hover:text-mosque transition-colors"
      >
        <span className="material-icons text-sm">open_in_new</span>
        <span>Ver Sitio Web</span>
      </Link>

      {/* Notifications icon matching code.html */}
      <button
        type="button"
        aria-label="Notificaciones"
        className="p-2 rounded-full text-nordic/50 hover:text-mosque hover:bg-mosque/5 transition-colors relative cursor-pointer"
      >
        <span className="material-icons text-xl">notifications_none</span>
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
      </button>

      {/* User Profile Container matching code.html */}
      <div className="relative" ref={menuRef}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-nordic/10 cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsOpen(!isOpen);
            }
          }}
        >
          {/* User Name & Role label (hidden on small screens) */}
          <div className="flex flex-col items-end hidden sm:flex text-right">
            <span className="text-sm font-semibold text-nordic group-hover:text-mosque transition-colors truncate max-w-[140px]">
              {userName}
            </span>
            <span className="text-[11px] font-medium text-mosque">
              Administrador
            </span>
          </div>

          {/* Avatar Image with ring matching code.html */}
          <div className="h-9 w-9 rounded-full bg-gray-100 overflow-hidden ring-2 ring-white group-hover:ring-mosque shadow-sm transition-all flex items-center justify-center border border-nordic/10">
            {userAvatar ? (
              <img
                alt={userName}
                className="h-full w-full object-cover"
                src={userAvatar}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-sm font-bold text-mosque uppercase">
                {userName.charAt(0)}
              </span>
            )}
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full mt-2 right-0 bg-white border border-nordic/10 shadow-dropdown rounded-2xl overflow-hidden z-50 w-64 animate-in fade-in zoom-in-95 duration-150">
            {/* User Info Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover border border-nordic/10 shadow-xs"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-bold text-nordic truncate">{userName}</p>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-mosque/10 text-mosque border border-mosque/20 rounded">
                      Admin
                    </span>
                  </div>
                  <p className="text-xs text-nordic/60 truncate mt-0.5">{userEmail}</p>
                </div>
              </div>
            </div>

            {/* Menu Links */}
            <div className="p-2 space-y-1">
              <Link
                href="/admin/propiedades"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-nordic hover:text-mosque hover:bg-mosque/5 rounded-xl transition-colors"
              >
                <span className="material-icons text-base text-mosque">apartment</span>
                <span>Gestión de Propiedades</span>
              </Link>
              <Link
                href="/admin/usuarios"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-nordic hover:text-mosque hover:bg-mosque/5 rounded-xl transition-colors"
              >
                <span className="material-icons text-base text-mosque">group</span>
                <span>Directorio de Usuarios</span>
              </Link>
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-nordic hover:text-mosque hover:bg-mosque/5 rounded-xl transition-colors sm:hidden"
              >
                <span className="material-icons text-base text-mosque">open_in_new</span>
                <span>Ver Sitio Web</span>
              </Link>
            </div>

            {/* Logout Action */}
            <div className="p-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSigningOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    <span>Cerrando sesión...</span>
                  </>
                ) : (
                  <>
                    <span className="material-icons text-base">logout</span>
                    <span>Cerrar Sesión</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
