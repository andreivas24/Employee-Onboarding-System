import type { UserRole } from './auth';

export type NotificationType =
  | 'REQUEST_CREATED'
  | 'REQUEST_APPROVED'
  | 'REQUEST_REJECTED'
  | 'REQUEST_RESUBMITTED'
  | 'FINANCE_APPROVED'
  | 'IT_COMPLETED';

export interface NotificationItem {
  id: number;
  requestId: number;
  targetRole: UserRole;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}