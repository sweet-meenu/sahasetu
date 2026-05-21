import { PostgresModel } from '../postgres-model';

export interface IResource {
  _id: string;
  title: string;
  description: string;
  
  // File info
  fileName: string;
  filePath: string;
  fileSize: number; // bytes
  mimeType: string;
  
  // Classification
  category: 'legal_guide' | 'posh_handbook' | 'workshop_material' | 'counseling_resource' | 'policy_template' | 'training_video' | 'helpline_directory' | 'other';
  tags: string[];
  
  // Ownership
  partnerId: string; // The Partner user who uploaded this
  partnerName: string; // Denormalized for quick display
  
  // Visibility & status
  visibility: 'public' | 'private' | 'shared';
  status: 'draft' | 'published' | 'archived';
  
  // Stats
  downloadCount: number;
  viewCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const Resource = new PostgresModel<IResource>('resources');

export default Resource;
