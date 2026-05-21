import { PostgresModel } from '../postgres-model';

export interface IPartner {
  _id: string;
  name: string;
  description: string;
  registrationNumber?: string;
  
  // Contact
  email: string;
  phone: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  
  // Geo location for proximity search
  coordinates?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  
  // Services
  services: ('legal_aid' | 'counseling' | 'shelter' | 'employment' | 'advocacy' | 'training' | 'mediation')[];
  specializations: string[];
  
  // Team
  contactPerson: string;
  teamSize?: number;
  
  // Verification
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  
  // Stats
  casesHandled: number;
  rating?: number;
  reviewCount: number;
  
  isActive: boolean;
  logo?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const Partner = new PostgresModel<IPartner>('partners');

export default Partner;
