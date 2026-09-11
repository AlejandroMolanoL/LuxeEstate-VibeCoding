'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { PropertyNotification } from '@/types/notification';
import { getNotifications } from '@/lib/notifications';
import { useFavorites } from '@/context/FavoritesContext';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface NotificationContextType {
  notifications: PropertyNotification[];
  unreadCount: number;
  isRead: (id: string) => boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const READ_STORAGE_KEY = 'luxe_read_notifications';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { favorites } = useFavorites();
  const [rawNotifications, setRawNotifications] = useState<PropertyNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check admin role
  useEffect(() => {
    const checkRole = async (user: User | null) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (!error && data?.role === 'admin') {
          setIsAdmin(true);
        } else if (user.email === 'molanolozanoalejandro@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch {
        if (user.email === 'molanolozanoalejandro@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkRole(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkRole(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load read notification IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(READ_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setReadIds(parsed);
        }
      }
    } catch (err) {
      console.error('Error loading read notifications:', err);
    }
  }, []);

  // Fetch notifications
  const fetchAllNotifications = useCallback(async () => {
    try {
      const data = await getNotifications(40);
      setRawNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllNotifications();

    // Poll every 15 seconds or on window focus
    const interval = setInterval(fetchAllNotifications, 15000);
    const onFocus = () => fetchAllNotifications();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchAllNotifications]);

  // Filter notifications according to audience
  const relevantNotifications = useMemo(() => {
    return rawNotifications.filter((n) => {
      if (isAdmin) {
        // Admins receive admin and broadcast notifications
        return n.target_role === 'admin' || n.target_role === 'all';
      } else {
        // Normal users receive notifications for properties they have favorited,
        // or general broadcast user notifications
        if (n.target_role === 'admin') return false;
        if (!n.property_id) return n.target_role === 'user' || n.target_role === 'all';
        return favorites.includes(n.property_id);
      }
    });
  }, [rawNotifications, isAdmin, favorites]);

  const isRead = useCallback(
    (id: string) => {
      return readIds.includes(id);
    },
    [readIds]
  );

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving read notifications:', err);
      }
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    const allIds = relevantNotifications.map((n) => n.id);
    setReadIds((prev) => {
      const merged = Array.from(new Set([...prev, ...allIds]));
      try {
        localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(merged));
      } catch (err) {
        console.error('Error saving read notifications:', err);
      }
      return merged;
    });
  }, [relevantNotifications]);

  const unreadCount = useMemo(() => {
    return relevantNotifications.filter((n) => !readIds.includes(n.id)).length;
  }, [relevantNotifications, readIds]);

  return (
    <NotificationContext.Provider
      value={{
        notifications: relevantNotifications,
        unreadCount,
        isRead,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchAllNotifications,
        isLoading,
        isAdmin,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
