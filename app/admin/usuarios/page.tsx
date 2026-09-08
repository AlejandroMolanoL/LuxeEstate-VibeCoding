import { supabase } from '@/lib/supabase';
import AdminUserDirectory, { DirectoryUser, UserRole } from '@/components/admin/AdminUserDirectory';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const { data: roles } = await supabase
    .from('user_roles')
    .select('*')
    .order('created_at', { ascending: false });

  // Map user_id to role from Supabase
  const roleMap: Record<string, UserRole> = {};
  (roles || []).forEach((r) => {
    roleMap[r.user_id] = r.role as UserRole;
  });

  const initialUsers: DirectoryUser[] = [
    {
      id: 'eaf46b0d-1fad-4c01-8a32-c8dce86f2814',
      name: 'Alejandro Molano',
      email: 'molanolozanoalejandro@gmail.com',
      role: roleMap['eaf46b0d-1fad-4c01-8a32-c8dce86f2814'] || 'admin',
      avatar: 'https://avatars.githubusercontent.com/u/69174170?v=4',
      provider: 'GitHub (AlejandroMolanoL)',
      status: 'Activo',
      created_at: '2026-09-05',
      propertiesCount: 'Todas',
      accessLevel: 'Nivel 5',
      isOnline: true,
    },
    {
      id: '569959a4-2c3a-4050-9a9a-ed96669bcbab',
      name: 'Alejandro Molano (Google)',
      email: 'esteropes1@gmail.com',
      role: roleMap['569959a4-2c3a-4050-9a9a-ed96669bcbab'] || 'user',
      avatar: 'https://lh3.googleusercontent.com/a/ACg8ocI1FSXGKY8pht6PMulcLKLUGHAxh7FWm5iR2E3ISEEgSI0RJW8=s96-c',
      provider: 'Google',
      status: 'Activo',
      created_at: '2026-09-06',
      propertiesCount: 0,
      accessLevel: 'Básico',
      isOnline: true,
    },
    {
      id: 'usr-2941-broker-sarah',
      name: 'Sarah Miller',
      email: 'sarah.miller@luxuryestates.com',
      role: 'broker',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      provider: 'Email Corporativo',
      status: 'Activo',
      created_at: '2026-08-15',
      propertiesCount: 24,
      accessLevel: 'Nivel 3',
      isOnline: true,
    },
    {
      id: 'usr-8821-agent-marcus',
      name: 'Marcus Chen',
      email: 'marcus.c@luxuryestates.com',
      role: 'agent',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      provider: 'Email Corporativo',
      status: 'Ausente',
      created_at: '2026-08-20',
      propertiesCount: 8,
      accessLevel: 'Nivel 2',
      isOnline: false,
    },
    {
      id: 'usr-1029-admin-elias',
      name: 'Elias Thorne',
      email: 'elias.thorne@luxuryestates.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      provider: 'SAML / SSO',
      status: 'Activo',
      created_at: '2026-07-10',
      propertiesCount: 'Todas',
      accessLevel: 'Nivel 5',
      isOnline: true,
    },
    {
      id: 'usr-3312-user-anna',
      name: 'Anna Koval',
      email: 'anna.koval@gmail.com',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      provider: 'Google',
      status: 'Inactivo',
      created_at: '2026-09-01',
      propertiesCount: 0,
      accessLevel: 'Básico',
      isOnline: false,
    },
  ];

  return <AdminUserDirectory initialUsers={initialUsers} />;
}
