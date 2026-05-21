import { PostgresModel } from '../postgres-model';

export interface INotification {
  _id: string;
  userId: string;
  type: 'status_update' | 'case_assigned' | 'hearing_scheduled' | 'resolution' | 'general';
  title: string;
  message: string;
  relatedCaseId?: string;      // human-readable CASE-YYYY-XXXX
  relatedComplaintId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const Notification = new PostgresModel<INotification>('notifications');

export default Notification;
