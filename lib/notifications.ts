import { supabase } from './supabase';
import { PropertyNotification, NotificationType, NotificationTargetRole } from '@/types/notification';

export interface CreateNotificationParams {
  property_id: string;
  title: string;
  message: string;
  type: NotificationType;
  target_role: NotificationTargetRole;
  old_price?: number;
  new_price?: number;
}

/**
 * Inserts a notification record into Supabase.
 */
export async function createNotification(params: CreateNotificationParams): Promise<boolean> {
  try {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const { error } = await supabase
      .from('notifications')
      .insert([
        {
          id,
          property_id: params.property_id,
          title: params.title,
          message: params.message,
          type: params.type,
          target_role: params.target_role,
          old_price: params.old_price ?? null,
          new_price: params.new_price ?? null,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error creating notification in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return false;
  }
}

/**
 * Fetches notifications from Supabase, ordered with newest first.
 */
export async function getNotifications(limit: number = 30): Promise<PropertyNotification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notifications:', error.message);
      return [];
    }

    return (data || []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      property_id: row.property_id as string,
      title: row.title as string,
      message: row.message as string,
      type: row.type as NotificationType,
      target_role: row.target_role as NotificationTargetRole,
      old_price: row.old_price ? Number(row.old_price) : undefined,
      new_price: row.new_price ? Number(row.new_price) : undefined,
      created_at: (row.created_at as string) || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
    return [];
  }
}
