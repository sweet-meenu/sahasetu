import { PostgresModel } from '../postgres-model';

export interface IEvidenceAccessLog {
  userId: string;
  action: 'view' | 'download' | 'share';
  timestamp: Date;
  ipAddress?: string;
}

export interface IEvidence {
  _id: string;
  userId: string;
  complaintId?: string;
  
  // File info
  originalName: string;
  mimeType: string;
  fileSize: number;
  
  // Encryption details
  encryptedPath: string; // Path to encrypted file on disk
  encryptionIV: string; // Initialization vector (hex)
  encryptionTag: string; // Auth tag for AES-GCM (hex)
  encryptedFileKey: string; // File key encrypted with master key (hex)
  
  // Metadata
  category: 'image' | 'document' | 'audio' | 'video' | 'other';
  description?: string;
  tags: string[];
  
  // Access control
  accessLog: IEvidenceAccessLog[];
  sharedWith: string[];
  
  isDeleted: boolean;
  deletedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  save(): Promise<any>;
}

const Evidence = new PostgresModel<IEvidence>('evidence');

export default Evidence;
