import { createClient } from '@/lib/supabase/server';
import AdminUserDirectory, { DirectoryUser, UserRole } from '@/components/admin/AdminUserDirectory';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Obtener usuarios reales directamente desde Supabase mediante la función RPC segura
  const { data: dbUsers, error } = await supabase.rpc('get_admin_users');

  if (error) {
    console.error('Error fetching admin users from Supabase:', error);
  }

  // Mapear los usuarios reales obtenidos desde Supabase a la interfaz del directorio
  const initialUsers: DirectoryUser[] = (dbUsers || []).map((u: any) => ({
    id: u.id,
    name: u.name || u.email?.split('@')[0] || 'Usuario',
    email: u.email || '',
    role: (u.role || 'user') as UserRole,
    avatar: u.avatar || '',
    provider: u.provider || 'OAuth',
    status: (u.status || 'Activo') as 'Activo' | 'Ausente' | 'Inactivo',
    created_at: u.created_at || new Date().toISOString().split('T')[0],
    propertiesCount: u.role === 'admin' ? 'Todas' : u.role === 'broker' ? 24 : u.role === 'agent' ? 8 : 0,
    accessLevel:
      u.role === 'admin'
        ? 'Nivel 5'
        : u.role === 'broker'
        ? 'Nivel 3'
        : u.role === 'agent'
        ? 'Nivel 2'
        : 'Básico',
    isOnline: !!u.last_sign_in_at,
  }));

  return <AdminUserDirectory initialUsers={initialUsers} />;
}
