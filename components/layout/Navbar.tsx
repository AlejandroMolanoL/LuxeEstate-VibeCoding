'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  dictionary?: any;
  currentLocale?: string;
}

export default function Navbar({ activeTab = 'Buy', onTabChange, dictionary, currentLocale = 'es' }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(activeTab);
  const router = useRouter();
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
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
            <button className="flex items-center gap-2 pl-2 border-l border-nordic-dark/10 ml-2">
              <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-mosque transition-all">
                <img
                  alt="User Profile"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAWhQZ663Bd08kmzjbOPmUk4UIxYooNONShMEFXLR-DtmVi6Oz-TiaY77SPwFk7g0OobkeZEOMvt6v29mSOD0Xm2g95WbBG3ZjWXmiABOUwGU0LOySRfVDo-JTXQ0-gtwjWxbmue0qDm91m-zEOEZwAW6iRFB1qC1bAU-wkjxm67Sbztq8w7srHkFT9bVEC86qG-FzhOBTomhAurNRmx9l8Yfqabk328NfdKuVLckgCdaPsNFE3yN65MeoRi05GA_gXIMwG4YDIeA"
                />
              </div>
            </button>

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
        </div>
      )}
    </nav>
  );
}
