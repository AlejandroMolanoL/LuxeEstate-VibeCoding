export type NotificationType =
  | 'NEW_PROPERTY'
  | 'PROPERTY_UPDATED'
  | 'PRICE_DROP'
  | 'PROPERTY_SOLD'
  | 'PROPERTY_RENTED';

export type NotificationTargetRole = 'admin' | 'user' | 'all';

export interface PropertyNotification {
  id: string;
  property_id: string;
  title: string;
  message: string;
  type: NotificationType;
  target_role: NotificationTargetRole;
  old_price?: number;
  new_price?: number;
  created_at: string;
}
