import { PostgresModel } from '../postgres-model';

export interface IAuditLog {
  _id: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  
  action: string;
  entityType: 'user' | 'complaint' | 'evidence' | 'counseling' | 'partner' | 'committee' | 'system';
  entityId?: string;
  
  description: string;
  metadata?: Record<string, unknown>;
  
  ipAddress?: string;
  userAgent?: string;
  
  severity: 'info' | 'warning' | 'critical';
  
  createdAt: Date;
}

const AuditLog = new PostgresModel<IAuditLog>('audit_logs');

export default AuditLog;
