'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  favoriteCount: number;
  clearFavorites: () => void;
  isLoaded: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'luxe_estate_favorites';
const COOKIE_KEY = 'luxe_favorites';

function syncFavoritesCookie(favs: string[]) {
  if (typeof document === 'undefined') return;
  const cookieValue = encodeURIComponent(favs.join(','));
  document.cookie = `${COOKIE_KEY}=${cookieValue}; path=/; max-age=31536000; SameSite=Lax`;
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
          syncFavoritesCookie(parsed);
        }
      } else {
        // Fallback: check cookie if localStorage was empty
        const cookieMatch = document.cookie.split('; ').find(row => row.startsWith(`${COOKIE_KEY}=`));
        if (cookieMatch) {
          const raw = decodeURIComponent(cookieMatch.split('=')[1] || '');
          const fromCookie = raw.split(',').filter(Boolean);
          if (fromCookie.length > 0) {
            setFavorites(fromCookie);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fromCookie));
          }
        }
      }
    } catch (err) {
      console.error('Error loading favorites from storage:', err);
    } finally {
      setIsLoaded(true);
    }

    // Sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) {
            setFavorites(updated);
            syncFavoritesCookie(updated);
          }
        } catch (err) {
          console.error('Error syncing favorites across tabs:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    if (!id) return;
    setFavorites(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        syncFavoritesCookie(updated);
      } catch (err) {
        console.error('Error saving favorite:', err);
      }
      return updated;
    });
  }, []);

  const isFavorite = useCallback((id: string) => {
    return favorites.includes(id);
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      syncFavoritesCookie([]);
    } catch (err) {
      console.error('Error clearing favorites:', err);
    }
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        favoriteCount: favorites.length,
        clearFavorites,
        isLoaded,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
