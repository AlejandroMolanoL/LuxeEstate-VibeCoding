'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';

interface NotificationPopoverProps {
  dictionary?: any;
}

function getNotificationVisuals(type: NotificationType) {
  switch (type) {
    case 'NEW_PROPERTY':
      return {
        icon: 'add_home',
        bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        badge: 'Nueva',
      };
    case 'PRICE_DROP':
      return {
        icon: 'trending_down',
        bg: 'bg-green-50 text-green-600 border-green-100',
        badge: 'Oferta',
      };
    case 'PROPERTY_SOLD':
      return {
        icon: 'monetization_on',
        bg: 'bg-amber-50 text-amber-700 border-amber-100',
        badge: 'Vendida',
      };
    case 'PROPERTY_RENTED':
      return {
        icon: 'key',
        bg: 'bg-purple-50 text-purple-700 border-purple-100',
        badge: 'Alquilada',
      };
    case 'PROPERTY_UPDATED':
    default:
      return {
        icon: 'edit_note',
        bg: 'bg-blue-50 text-blue-600 border-blue-100',
        badge: 'Actualizada',
      };
  }
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Hace un momento';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString();
  } catch {
    return 'Reciente';
  }
}

export default function NotificationPopover({ dictionary }: NotificationPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { notifications, unreadCount, isRead, markAsRead, markAllAsRead, isAdmin } = useNotifications();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (id: string, propertyId?: string) => {
    markAsRead(id);
    setIsOpen(false);
    if (propertyId) {
      router.push(`/propiedades/${propertyId}`);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificaciones"
        className="text-nordic-dark hover:text-mosque transition-colors relative p-1.5 rounded-full hover:bg-black/5 cursor-pointer flex items-center justify-center"
      >
        <span className="material-icons text-2xl">
          {unreadCount > 0 ? 'notifications_active' : 'notifications_none'}
        </span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-background-light flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-nordic-dark">
                {dictionary?.notifications?.title || 'Notificaciones'}
              </span>
              {isAdmin && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-mosque/10 text-mosque px-1.5 py-0.5 rounded border border-mosque/20">
                  Admin
                </span>
              )}
              {unreadCount > 0 && (
                <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} nuevas
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-medium text-mosque hover:text-primary-dark transition-colors cursor-pointer flex items-center gap-1"
                title="Marcar todas como leídas"
              >
                <span className="material-icons text-sm">done_all</span>
                <span>Marcar leídas</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50 hide-scroll">
            {notifications.length > 0 ? (
              notifications.map((item) => {
                const read = isRead(item.id);
                const visual = getNotificationVisuals(item.type);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item.id, item.property_id)}
                    className={`p-4 transition-colors cursor-pointer flex gap-3 items-start group ${
                      read ? 'bg-white hover:bg-gray-50' : 'bg-mosque/5 hover:bg-mosque/10'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${visual.bg} transition-transform group-hover:scale-105`}
                    >
                      <span className="material-icons text-lg">{visual.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4
                          className={`text-xs font-bold truncate ${
                            read ? 'text-nordic-dark' : 'text-mosque'
                          }`}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {formatRelativeTime(item.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-snug line-clamp-2">
                        {item.message}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!read && (
                      <span className="w-2 h-2 rounded-full bg-mosque flex-shrink-0 mt-1.5"></span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                  <span className="material-icons text-2xl">notifications_off</span>
                </div>
                <p className="text-sm font-semibold text-nordic-dark mb-1">
                  Sin notificaciones
                </p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  {isAdmin
                    ? 'Te avisaremos cuando se cree, modifique, venda o alquile una propiedad.'
                    : 'Agrega propiedades a tus favoritos para recibir avisos cuando bajen de precio o ya no estén disponibles.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
