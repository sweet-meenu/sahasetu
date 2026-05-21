import { PostgresModel } from '../postgres-model';

export interface ICommitteeMember {
  userId: string;
  role: 'presiding_officer' | 'member' | 'external_member' | 'secretary';
  name: string;
  email: string;
  designation?: string;
  joinedAt: Date;
  isActive: boolean;
}

export interface ICommittee {
  _id: string;
  name: string;
  type: 'ICC' | 'LCC'; // Internal Complaints Committee / Local Complaints Committee
  description?: string;
  
  // Organization
  organizationName: string;
  organizationId?: string;
  
  // Members
  members: ICommitteeMember[];
  
  // Jurisdiction
  district?: string;
  state?: string;
  
  // PoSH Compliance
  constitutedOn: Date;
  validUntil: Date;
  isConstitutedAsPerAct: boolean;
  hasExternalMember: boolean;
  hasWomenMajority: boolean;
  
  // Contact
  email: string;
  phone?: string;
  address?: string;
  
  // Partnership
  partnerOrganizations: string[];
  
  // Stats
  totalCases: number;
  resolvedCases: number;
  pendingCases: number;
  avgResolutionDays: number;
  
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const Committee = new PostgresModel<ICommittee>('committees');

export default Committee;
