import { PostgresModel } from '../postgres-model';

export interface ICounselingSession {
  _id: string;
  userId: string;
  counselorId: string;
  complaintId?: string;
  
  type: 'video' | 'voice' | 'chat';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  
  scheduledAt: Date;
  duration?: number; // in minutes
  startedAt?: Date;
  endedAt?: Date;
  
  notes?: string; // Encrypted counselor notes
  feedback?: {
    rating: number;
    comment: string;
    submittedAt: Date;
  };
  
  voiceDistortion: boolean;
  isAnonymous: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  save(): Promise<any>;
}

const CounselingSession = new PostgresModel<ICounselingSession>('counseling_sessions');

export default CounselingSession;
