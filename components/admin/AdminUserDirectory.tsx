'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'broker' | 'agent' | 'user';

export interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  provider: string;
  status: 'Activo' | 'Ausente' | 'Inactivo';
  created_at: string;
  propertiesCount?: number | string;
  accessLevel?: string;
  isOnline?: boolean;
}

interface AdminUserDirectoryProps {
  initialUsers: DirectoryUser[];
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  broker: 'Broker',
  agent: 'Agente',
  user: 'Usuario',
};

const ROLE_BADGE_STYLES: Record<UserRole, { bg: string; text: string; dot: string }> = {
  admin: { bg: 'bg-nordic text-white', text: 'Administrador', dot: 'bg-emerald-400' },
  broker: { bg: 'bg-mosque/15 text-mosque border border-mosque/20', text: 'Broker', dot: 'bg-mosque' },
  agent: { bg: 'bg-amber-100 text-amber-900 border border-amber-200', text: 'Agente', dot: 'bg-amber-600' },
  user: { bg: 'bg-gray-100 text-gray-700 border border-gray-200', text: 'Usuario', dot: 'bg-gray-400' },
};

export default function AdminUserDirectory({ initialUsers }: AdminUserDirectoryProps) {
  const [users, setUsers] = useState<DirectoryUser[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleChip, setSelectedRoleChip] = useState<'all' | UserRole>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Compute counts for filter chips
  const roleCounts = useMemo(() => {
    return {
      all: users.length,
      admin: users.filter((u) => u.role === 'admin').length,
      broker: users.filter((u) => u.role === 'broker').length,
      agent: users.filter((u) => u.role === 'agent').length,
      user: users.filter((u) => u.role === 'user').length,
    };
  }, [users]);

  // Filter users by search query and role chip
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Role chip filter
      if (selectedRoleChip !== 'all' && user.role !== selectedRoleChip) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = user.name?.toLowerCase().includes(q);
        const emailMatch = user.email?.toLowerCase().includes(q);
        const idMatch = user.id?.toLowerCase().includes(q);
        const providerMatch = user.provider?.toLowerCase().includes(q);
        return nameMatch || emailMatch || idMatch || providerMatch;
      }

      return true;
    });
  }, [users, selectedRoleChip, searchQuery]);

  // Pagination calculations
  const totalResults = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, safeCurrentPage, pageSize]);

  const startRecord = totalResults === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(safeCurrentPage * pageSize, totalResults);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleChipChange = (chipKey: 'all' | UserRole) => {
    setSelectedRoleChip(chipKey);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Handle dynamic role change
  const handleRoleChange = async (user: DirectoryUser, newRole: UserRole) => {
    if (user.role === newRole) {
      setOpenDropdownId(null);
      return;
    }

    setIsUpdating(user.id);
    setOpenDropdownId(null);

    // 1. Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
    );

    try {
      // 2. Persist to Supabase user_roles using secure RPC
      const { error: rpcError } = await supabase.rpc('set_user_role', {
        target_user_id: user.id,
        new_role: newRole,
      });

      if (rpcError) {
        // Fallback to direct upsert
        const { error: upsertError } = await supabase
          .from('user_roles')
          .upsert(
            {
              user_id: user.id,
              role: newRole,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );

        if (upsertError) {
          throw upsertError;
        }
      }

      setToastMessage(`Rol de ${user.name} actualizado a ${ROLE_LABELS[newRole]}`);
    } catch (err: unknown) {
      console.error('Error updating user role:', err);
      // Revert optimistic update on failure
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: user.role } : u))
      );
      setToastMessage(`Error al guardar el rol en Supabase.`);
    } finally {
      setIsUpdating(null);
    }
  };

  const chips: Array<{ key: 'all' | UserRole; label: string; count: number }> = [
    { key: 'all', label: 'Todos', count: roleCounts.all },
    { key: 'admin', label: 'Administradores', count: roleCounts.admin },
    { key: 'broker', label: 'Brokers', count: roleCounts.broker },
    { key: 'agent', label: 'Agentes', count: roleCounts.agent },
    { key: 'user', label: 'Usuarios', count: roleCounts.user },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-display">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-nordic text-white px-5 py-3 rounded-xl shadow-dropdown flex items-center gap-3 border border-white/10 animate-bounce">
          <span className="material-icons text-emerald-400 text-xl">check_circle</span>
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2"
          >
            <span className="material-icons text-sm">close</span>
          </button>
        </div>
      )}

      {/* Header Section matching code.html */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-nordic">
            Directorio de Usuarios
          </h1>
          <p className="text-nordic/60 mt-1 text-sm">
            Gestiona los accesos, asigna roles del personal y supervisa la actividad.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative group w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-nordic/40 group-focus-within:text-mosque text-xl">
                search
              </span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por nombre, correo o ID..."
              className="block w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-nordic/15 text-nordic placeholder-nordic/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-mosque focus:border-mosque text-sm transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-nordic/40 hover:text-nordic"
              >
                <span className="material-icons text-sm">close</span>
              </button>
            )}
          </div>

          <Link
            href="/admin/propiedades"
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 border border-nordic/15 text-sm font-medium rounded-xl text-nordic bg-white hover:bg-gray-50 shadow-sm transition-colors whitespace-nowrap gap-2"
          >
            <span className="material-icons text-base text-mosque">apartment</span>
            <span>Ver Propiedades</span>
          </Link>
        </div>
      </div>

      {/* Role Filter Chips matching code.html */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 border-b border-nordic/10">
        {chips.map((chip) => {
          const isActive = selectedRoleChip === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => handleChipChange(chip.key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-mosque text-white shadow-sm ring-1 ring-mosque'
                  : 'bg-white text-nordic/70 hover:text-nordic hover:bg-black/5 border border-nordic/10'
              }`}
            >
              <span>{chip.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-nordic/5 text-nordic/60'
                }`}
              >
                {chip.count}
              </span>
            </button>
          );
        })}

        {(selectedRoleChip !== 'all' || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              handleChipChange('all');
              handleSearchChange('');
            }}
            className="text-xs text-mosque hover:underline font-medium ml-2 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span className="material-icons text-xs">restart_alt</span>
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Desktop Column Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-nordic/50 mb-3">
        <div className="col-span-4">Detalles del Usuario</div>
        <div className="col-span-3">Rol &amp; Estado</div>
        <div className="col-span-3">Propiedades / Acceso</div>
        <div className="col-span-2 text-right">Acciones</div>
      </div>

      {/* User Cards List */}
      <div className="space-y-3" ref={dropdownRef}>
        {paginatedUsers.length > 0 ? (
          paginatedUsers.map((user) => {
            const isDropdownOpen = openDropdownId === user.id;
            const badge = ROLE_BADGE_STYLES[user.role] || ROLE_BADGE_STYLES.user;
            const shortId = user.id.slice(0, 8).toUpperCase();

            return (
              <div
                key={user.id}
                className="user-card group relative bg-white rounded-2xl p-5 shadow-sm border border-nordic/10 hover:border-mosque/30 hover:shadow-soft transition-all flex flex-col md:grid md:grid-cols-12 gap-4 items-center"
              >
                {/* Column 1: User Details */}
                <div className="col-span-12 md:col-span-4 flex items-center w-full">
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <span
                      className={`absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full ring-2 ring-white ${
                        user.status === 'Activo'
                          ? 'bg-emerald-500'
                          : user.status === 'Ausente'
                          ? 'bg-amber-400'
                          : 'bg-gray-400'
                      }`}
                      title={user.status}
                    />
                  </div>
                  <div className="ml-4 overflow-hidden min-w-0 flex-1">
                    <div className="text-sm font-bold text-nordic truncate group-hover:text-mosque transition-colors">
                      {user.name}
                    </div>
                    <div className="text-xs text-nordic/60 truncate">{user.email}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 inline-block bg-nordic/5 rounded text-nordic/60 font-mono font-medium">
                        ID: #{shortId}
                      </span>
                      {user.provider && (
                        <span className="text-[10px] text-nordic/40 truncate">
                          • {user.provider}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 2: Role & Status */}
                <div className="col-span-12 md:col-span-3 w-full flex items-center justify-between md:justify-start gap-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${badge.bg}`}
                  >
                    {ROLE_LABELS[user.role]}
                  </span>
                  <div className="flex items-center text-xs text-nordic/60">
                    <span
                      className={`material-icons text-[15px] mr-1 ${
                        user.status === 'Activo'
                          ? 'text-emerald-600'
                          : user.status === 'Ausente'
                          ? 'text-amber-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {user.status === 'Activo' ? 'check_circle' : 'schedule'}
                    </span>
                    <span>{user.status}</span>
                  </div>
                </div>

                {/* Column 3: Stats / Access */}
                <div className="col-span-12 md:col-span-3 w-full grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-nordic/50 font-semibold">
                      Inmuebles
                    </div>
                    <div className="text-sm font-semibold text-nordic">
                      {user.propertiesCount ?? (user.role === 'admin' ? 'Todos' : user.role === 'broker' ? '12' : user.role === 'agent' ? '6' : '-')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-nordic/50 font-semibold">
                      Nivel Acceso
                    </div>
                    <div className="text-sm font-semibold text-nordic">
                      {user.role === 'admin' ? 'Total (Nivel 5)' : user.role === 'broker' ? 'Nivel 3' : user.role === 'agent' ? 'Nivel 2' : 'Básico'}
                    </div>
                  </div>
                </div>

                {/* Column 4: Actions (Change Role Dropdown) */}
                <div className="col-span-12 md:col-span-2 w-full flex justify-end relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdownId(isDropdownOpen ? null : user.id)}
                    disabled={isUpdating === user.id}
                    className={`inline-flex items-center px-3.5 py-2 border text-xs font-semibold rounded-xl transition-all w-full md:w-auto justify-center cursor-pointer shadow-sm ${
                      isDropdownOpen
                        ? 'bg-mosque text-white border-mosque shadow-md'
                        : 'border-nordic/15 bg-white text-nordic hover:border-mosque hover:text-mosque'
                    }`}
                  >
                    {isUpdating === user.id ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-mosque border-t-transparent rounded-full animate-spin mr-1.5" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <span>Cambiar Rol</span>
                        <span className="material-icons text-[16px] ml-1.5">
                          {isDropdownOpen ? 'expand_less' : 'expand_more'}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Dropdown Menu matching code.html */}
                  {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-52 rounded-xl shadow-dropdown bg-primary border border-white/10 text-white ring-1 ring-black/5 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-150">
                      <div className="py-1" role="menu">
                        <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white/50 border-b border-white/10">
                          Seleccionar Rol
                        </div>

                        {/* Administrator */}
                        <button
                          type="button"
                          onClick={() => handleRoleChange(user, 'admin')}
                          className={`w-full text-left group flex items-center px-4 py-2.5 text-xs transition-colors cursor-pointer ${
                            user.role === 'admin'
                              ? 'bg-white/20 text-white font-semibold'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="material-icons text-sm mr-3 text-white/60 group-hover:text-white">
                            shield
                          </span>
                          <div className="flex-1">
                            <div>Administrador</div>
                            <div className="text-[10px] text-white/50">Control total del sistema</div>
                          </div>
                          {user.role === 'admin' && (
                            <span className="material-icons text-xs text-white">check</span>
                          )}
                        </button>

                        {/* Broker */}
                        <button
                          type="button"
                          onClick={() => handleRoleChange(user, 'broker')}
                          className={`w-full text-left group flex items-center px-4 py-2.5 text-xs transition-colors cursor-pointer ${
                            user.role === 'broker'
                              ? 'bg-white/20 text-white font-semibold'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="material-icons text-sm mr-3 text-white/60 group-hover:text-white">
                            business_center
                          </span>
                          <div className="flex-1">
                            <div>Broker</div>
                            <div className="text-[10px] text-white/50">Gestión de cartera y equipo</div>
                          </div>
                          {user.role === 'broker' && (
                            <span className="material-icons text-xs text-white">check</span>
                          )}
                        </button>

                        {/* Agent */}
                        <button
                          type="button"
                          onClick={() => handleRoleChange(user, 'agent')}
                          className={`w-full text-left group flex items-center px-4 py-2.5 text-xs transition-colors cursor-pointer ${
                            user.role === 'agent'
                              ? 'bg-white/20 text-white font-semibold'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="material-icons text-sm mr-3 text-white/60 group-hover:text-white">
                            support_agent
                          </span>
                          <div className="flex-1">
                            <div>Agente</div>
                            <div className="text-[10px] text-white/50">Publicar y editar inmuebles</div>
                          </div>
                          {user.role === 'agent' && (
                            <span className="material-icons text-xs text-white">check</span>
                          )}
                        </button>

                        {/* User */}
                        <button
                          type="button"
                          onClick={() => handleRoleChange(user, 'user')}
                          className={`w-full text-left group flex items-center px-4 py-2.5 text-xs transition-colors cursor-pointer ${
                            user.role === 'user'
                              ? 'bg-white/20 text-white font-semibold'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="material-icons text-sm mr-3 text-white/60 group-hover:text-white">
                            person
                          </span>
                          <div className="flex-1">
                            <div>Usuario</div>
                            <div className="text-[10px] text-white/50">Visualización estándar</div>
                          </div>
                          {user.role === 'user' && (
                            <span className="material-icons text-xs text-white">check</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-nordic/10 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-nordic/5 text-nordic/40 mx-auto flex items-center justify-center mb-3">
              <span className="material-icons text-2xl">person_search</span>
            </div>
            <h3 className="text-base font-bold text-nordic">No se encontraron usuarios</h3>
            <p className="text-xs text-nordic/60 mt-1 max-w-sm mx-auto">
              No hay usuarios que coincidan con &ldquo;{searchQuery}&rdquo; en la categoría seleccionada.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedRoleChip('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-mosque text-white rounded-xl text-xs font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalResults > 0 && (
        <div className="bg-white rounded-2xl border border-nordic/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mt-6">
          <div className="text-sm text-nordic/70">
            Mostrando <span className="font-semibold text-nordic">{startRecord}</span> a{' '}
            <span className="font-semibold text-nordic">{endRecord}</span> de{' '}
            <span className="font-semibold text-nordic">{totalResults}</span> usuarios
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage <= 1}
              className="px-3 py-1.5 text-xs font-medium border border-nordic/15 rounded-xl text-nordic/80 hover:bg-gray-50 hover:border-mosque disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span className="material-icons text-sm">chevron_left</span>
              <span>Anterior</span>
            </button>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isActive = pageNum === safeCurrentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer ${
                      isActive
                        ? 'bg-mosque text-white shadow-sm'
                        : 'border border-nordic/15 text-nordic/70 hover:bg-gray-50 hover:border-mosque'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              className="px-3 py-1.5 text-xs font-medium border border-nordic/15 rounded-xl text-nordic/80 hover:bg-gray-50 hover:border-mosque disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Siguiente</span>
              <span className="material-icons text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
