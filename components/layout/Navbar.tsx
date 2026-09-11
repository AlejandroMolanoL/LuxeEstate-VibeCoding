'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useFavorites } from '@/context/FavoritesContext';
import NotificationPopover from './NotificationPopover';

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  dictionary?: any;
  currentLocale?: string;
}

export default function Navbar({ activeTab = '', onTabChange, dictionary, currentLocale = 'es' }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentTab, setCurrentTab] = useState(activeTab);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { favoriteCount } = useFavorites();
  const langMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const urlFilter = searchParams ? searchParams.get('filter') : null;

  const isItemActive = (item: string) => {
    if (urlFilter) {
      if (item === 'Rent') return urlFilter === 'Rent';
      if (item === 'Buy') return urlFilter === 'Buy' || urlFilter === 'Sell';
      if (item === 'Saved Homes') return urlFilter === 'Saved';
      return false;
    }
    return currentTab === item;
  };

  // Subscribe to auth state changes and get initial session
  useEffect(() => {
    const checkAdminStatus = async (currentUser: User | null) => {
      if (!currentUser) {
        setIsAdmin(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', currentUser.id)
          .single();

        if (!error && data?.role === 'admin') {
          setIsAdmin(true);
        } else if (currentUser.email === 'molanolozanoalejandro@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        if (currentUser.email === 'molanolozanoalejandro@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      checkAdminStatus(currentUser);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      checkAdminStatus(currentUser);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = ['Buy', 'Rent', 'Saved Homes'];

  const getTranslatedItem = (item: string) => {
    if (!dictionary) return item;
    switch (item) {
      case 'Buy': return dictionary.buy;
      case 'Rent': return dictionary.rent;
      case 'Saved Homes': return dictionary.saved_homes;
      default: return item;
    }
  };

  const handleTabClick = (item: string) => {
    setCurrentTab(item);
    if (onTabChange) {
      onTabChange(item);
    }
    if (item === 'Rent') {
      router.push('/?filter=Rent#propiedades');
    } else if (item === 'Buy') {
      router.push('/?filter=Buy#propiedades');
    } else if (item === 'Saved Homes') {
      router.push('/?filter=Saved#propiedades');
    }
  };

  const renderItemContent = (item: string) => {
    const label = getTranslatedItem(item);
    if (item === 'Saved Homes' && favoriteCount > 0) {
      return (
        <span className="inline-flex items-center gap-1.5">
          <span>{label}</span>
          <span className="px-1.5 py-0.2 text-[10px] font-bold bg-mosque text-white rounded-full leading-tight">
            {favoriteCount}
          </span>
        </span>
      );
    }
    return label;
  };

  const handleLanguageChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    window.location.reload();
  };

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User';
  const userEmail = user?.email || '';

  const flags = {
    es: "https://flagcdn.com/w20/es.png",
    en: "https://flagcdn.com/w20/us.png",
    fr: "https://flagcdn.com/w20/fr.png"
  };

  return (
    <nav className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-md border-b border-nordic-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-nordic-dark flex items-center justify-center">
              <span className="material-icons text-white text-lg">apartment</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-nordic-dark">
              LuxeEstate
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = isItemActive(item);
              return (
                <button
                  key={item}
                  onClick={() => handleTabClick(item)}
                  className={
                    isActive
                      ? 'text-mosque font-semibold text-sm border-b-2 border-mosque px-1 py-1 transition-all cursor-pointer'
                      : 'text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all cursor-pointer'
                  }
                >
                  {renderItemContent(item)}
                </button>
              );
            })}
          </div>

          {/* Header Action Icons */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Custom Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                aria-label="Select language"
              >
                <img
                  src={flags[currentLocale as keyof typeof flags] || flags.es}
                  alt={currentLocale}
                  className="w-5 h-auto rounded-[2px] shadow-sm"
                />
                <span className="text-sm font-medium text-nordic-dark uppercase">{currentLocale}</span>
                <span className="material-icons text-nordic-dark/70 text-[16px]">expand_more</span>
              </button>

              {isLangMenuOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-mosque/10 shadow-lg rounded-xl overflow-hidden z-50 w-24 py-1">
                  {(['es', 'en', 'fr'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => {
                        handleLanguageChange(lang);
                        setIsLangMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 hover:bg-mosque/5 w-full text-left transition-colors ${currentLocale === lang ? 'bg-mosque/5 text-mosque' : 'text-nordic-dark'}`}
                    >
                      <img
                        src={flags[lang]}
                        alt={lang}
                        className="w-5 h-auto rounded-[2px] shadow-sm"
                      />
                      <span className="text-sm font-medium uppercase">{lang}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              aria-label="Search"
              className="text-nordic-dark hover:text-mosque transition-colors"
            >
              <span className="material-icons">search</span>
            </button>
            <NotificationPopover dictionary={dictionary} />
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 border-l border-nordic-dark/10 ml-2 focus:outline-none cursor-pointer"
                  aria-label="User Profile"
                >
                  <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden ring-2 ring-transparent hover:ring-mosque transition-all flex items-center justify-center border border-gray-200">
                    {userAvatar ? (
                      <img
                        alt={userName}
                        className="w-full h-full object-cover"
                        src={userAvatar}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-mosque uppercase">
                        {userName.charAt(0)}
                      </span>
                    )}
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-white border border-mosque/10 shadow-lg rounded-xl overflow-hidden z-50 w-60 py-2">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-nordic truncate">{userName}</p>
                        {isAdmin && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-mosque/10 text-mosque border border-mosque/20 rounded">
                            {dictionary?.admin_badge || 'Admin'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-nordic/60 truncate mt-0.5">{userEmail}</p>
                    </div>

                    {/* Admin Access Section */}
                    {isAdmin && (
                      <div className="py-1.5 border-b border-gray-100 bg-gray-50/40">
                        <p className="px-4 py-1 text-[10px] font-bold text-nordic/40 uppercase tracking-wider">
                          {dictionary?.admin_section || 'Administración'}
                        </p>
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-nordic hover:text-mosque hover:bg-mosque/5 transition-colors font-medium"
                        >
                          <span className="material-icons text-base text-mosque">dashboard</span>
                          <span>{dictionary?.admin_dashboard || 'Panel General'}</span>
                        </Link>
                        <Link
                          href="/admin/propiedades"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-nordic hover:text-mosque hover:bg-mosque/5 transition-colors font-medium"
                        >
                          <span className="material-icons text-base text-mosque">apartment</span>
                          <span>{dictionary?.admin_properties || 'Gestión de Propiedades'}</span>
                        </Link>
                        <Link
                          href="/admin/usuarios"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-nordic hover:text-mosque hover:bg-mosque/5 transition-colors font-medium"
                        >
                          <span className="material-icons text-base text-mosque">manage_accounts</span>
                          <span>{dictionary?.admin_users || 'Gestión de Usuarios'}</span>
                        </Link>
                      </div>
                    )}

                    <div className="pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <span className="material-icons text-base">logout</span>
                        <span>{dictionary?.logout || 'Sign Out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="pl-2 border-l border-nordic-dark/10 ml-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-primary-dark transition-all shadow-sm hover:shadow-soft-hover"
                >
                  <span className="material-icons text-base">login</span>
                  <span>{dictionary?.login || 'Sign In'}</span>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-nordic-dark p-1"
              aria-label="Toggle menu"
            >
              <span className="material-icons">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-nordic-dark/5 bg-background-light px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = isItemActive(item);
            return (
              <button
                key={item}
                onClick={() => {
                  handleTabClick(item);
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer ${isActive
                    ? 'text-mosque bg-mosque/10 font-semibold'
                    : 'text-nordic-dark hover:bg-black/5'
                  }`}
              >
                {renderItemContent(item)}
              </button>
            );
          })}

          <div className="pt-3 border-t border-nordic-dark/10 mt-2">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200">
                    {userAvatar ? (
                      <img
                        alt={userName}
                        className="w-full h-full object-cover"
                        src={userAvatar}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-mosque uppercase">
                        {userName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-nordic truncate">{userName}</p>
                    <p className="text-xs text-nordic/60 truncate">{userEmail}</p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-2 pb-1 border-t border-nordic-dark/10 space-y-1">
                    <p className="px-3 text-[10px] font-bold text-nordic-dark/40 uppercase tracking-wider">
                      {dictionary?.admin_section || 'Administración'}
                    </p>
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-nordic-dark hover:text-mosque hover:bg-mosque/5 rounded-md font-medium"
                    >
                      <span className="material-icons text-base text-mosque">dashboard</span>
                      <span>{dictionary?.admin_dashboard || 'Panel General'}</span>
                    </Link>
                    <Link
                      href="/admin/propiedades"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-nordic-dark hover:text-mosque hover:bg-mosque/5 rounded-md font-medium"
                    >
                      <span className="material-icons text-base text-mosque">apartment</span>
                      <span>{dictionary?.admin_properties || 'Gestión de Propiedades'}</span>
                    </Link>
                    <Link
                      href="/admin/usuarios"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-nordic-dark hover:text-mosque hover:bg-mosque/5 rounded-md font-medium"
                    >
                      <span className="material-icons text-base text-mosque">manage_accounts</span>
                      <span>{dictionary?.admin_users || 'Gestión de Usuarios'}</span>
                    </Link>
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2 font-medium cursor-pointer"
                >
                  <span className="material-icons text-base">logout</span>
                  <span>{dictionary?.logout || 'Sign Out'}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                <span className="material-icons text-base">login</span>
                <span>{dictionary?.login || 'Sign In'}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
