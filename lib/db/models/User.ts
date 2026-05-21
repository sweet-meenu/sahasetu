import { PostgresModel } from '../postgres-model';

export interface IUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    passwordHash: string;
    role: 'user' | 'admin' | 'partner' | 'counselor' | 'committee_member';
    organization?: string;
    avatar?: string;
    
    // Counselor / Partner specific fields
    specialization?: string[];
    languages?: string[];
    rating?: number;
    experience?: string;

    isVerified: boolean;
    isActive: boolean;
    anonymousId: string; // Used for anonymous interactions
    twoFactorEnabled: boolean;
    lastLogin?: Date;
    loginAttempts: number;
    lockUntil?: Date;
    createdAt: Date;
    updatedAt: Date;
    save(): Promise<any>;
}

const User = new PostgresModel<IUser>('users');

export default User;
