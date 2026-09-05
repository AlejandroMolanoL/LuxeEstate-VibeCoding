'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  dictionary?: any;
  currentLocale?: string;
}

export default function Navbar({ activeTab = 'Buy', onTabChange, dictionary, currentLocale = 'es' }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState(activeTab);
  const router = useRouter();
  const langMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Subscribe to auth state changes and get initial session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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

  const navItems = ['Buy', 'Rent', 'Sell', 'Saved Homes'];

  const getTranslatedItem = (item: string) => {
    if (!dictionary) return item;
    switch (item) {
      case 'Buy': return dictionary.buy;
      case 'Rent': return dictionary.rent;
      case 'Sell': return dictionary.sell;
      case 'Saved Homes': return dictionary.saved_homes;
      default: return item;
    }
  };

  const handleTabClick = (item: string) => {
    setCurrentTab(item);
    if (onTabChange) {
      onTabChange(item);
    }
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
              const isActive = currentTab === item;
              return (
                <button
                  key={item}
                  onClick={() => handleTabClick(item)}
                  className={
                    isActive
                      ? 'text-mosque font-medium text-sm border-b-2 border-mosque px-1 py-1 transition-all'
                      : 'text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all'
                  }
                >
                  {getTranslatedItem(item)}
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
            <button
              aria-label="Notifications"
              className="text-nordic-dark hover:text-mosque transition-colors relative"
            >
              <span className="material-icons">notifications_none</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-background-light"></span>
            </button>
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
                  <div className="absolute top-full mt-2 right-0 bg-white border border-mosque/10 shadow-lg rounded-xl overflow-hidden z-50 w-56 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-nordic truncate">{userName}</p>
                      <p className="text-xs text-nordic/60 truncate">{userEmail}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <span className="material-icons text-base">logout</span>
                      <span>{dictionary?.logout || 'Sign Out'}</span>
                    </button>
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
            const isActive = currentTab === item;
            return (
              <button
                key={item}
                onClick={() => {
                  handleTabClick(item);
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? 'text-mosque bg-mosque/10'
                    : 'text-nordic-dark hover:bg-black/5'
                }`}
              >
                {getTranslatedItem(item)}
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
