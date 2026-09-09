import Link from 'next/link';
import AdminUserNav from '@/components/admin/AdminUserNav';
import { getLocale, getDictionary } from '@/lib/i18n';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <div className="min-h-screen bg-background-light font-display text-nordic flex flex-col antialiased">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-nordic/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Navigation */}
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-lg bg-mosque flex items-center justify-center text-white shadow-soft transition-transform group-hover:scale-105">
                  <span className="material-icons text-xl">admin_panel_settings</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-nordic leading-tight tracking-tight">
                    Luxe<span className="text-mosque">Estate</span>
                  </span>
                  <span className="text-[10px] font-semibold text-mosque uppercase tracking-widest">
                    Admin Panel
                  </span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center space-x-1">
                <Link
                  href="/admin/propiedades"
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-nordic hover:text-mosque hover:bg-mosque/5 transition-colors flex items-center gap-2"
                >
                  <span className="material-icons text-lg">apartment</span>
                  <span>{dictionary?.navbar?.admin_properties || 'Propiedades'}</span>
                </Link>
                <Link
                  href="/admin/usuarios"
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-nordic hover:text-mosque hover:bg-mosque/5 transition-colors flex items-center gap-2"
                >
                  <span className="material-icons text-lg">group</span>
                  <span>{dictionary?.navbar?.admin_users || 'Usuarios'}</span>
                </Link>
              </nav>
            </div>

            {/* Right side: User profile, notifications, language switcher and sign out */}
            <AdminUserNav currentLocale={locale} dictionary={dictionary} />
          </div>
        </div>
      </header>

      {/* Main Admin Page Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
