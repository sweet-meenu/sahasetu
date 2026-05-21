import { PostgresModel, query } from '../postgres-model';

export interface ITimelineEntry {
  status: string;
  description: string;
  updatedBy?: string;
  updatedByRole?: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface IComplaint {
  _id: string;
  caseId: string; // Human-readable case ID like CASE-2026-0001
  userId: string;
  isAnonymous: boolean;

  // Incident Details
  incidentDate: Date;
  incidentTime?: string;
  location?: string;
  incidentType: 'verbal' | 'physical' | 'visual' | 'quid_pro_quo' | 'hostile_environment' | 'online' | 'stalking' | 'other';
  description: string;
  perpetratorInfo?: string;
  witnesses?: string;
  previousIncidents?: string;

  // Status & Tracking
  status: 'draft' | 'submitted' | 'under_review' | 'investigation' | 'hearing_scheduled' | 'hearing_in_progress' | 'resolution_pending' | 'resolved' | 'closed' | 'appealed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeline: ITimelineEntry[];

  // Assignment
  assignedCommittee?: string;
  assignedPartner?: string;
  assignedMembers: any[];

  // Deadlines (PoSH Act mandates 90-day resolution)
  submittedAt?: Date;
  resolutionDeadline?: Date;
  nextHearingDate?: Date;

  // Submission settings
  isEncrypted: boolean;
  delayedSubmission: boolean;
  scheduledSubmitDate?: Date;

  // Resolution
  resolution?: string;
  resolutionDate?: Date;

  createdAt: Date;
  updatedAt: Date;
  save(): Promise<any>;
}

class ComplaintModel extends PostgresModel<IComplaint> {
  constructor() {
    super('complaints');
  }

  async create(data: any): Promise<IComplaint> {
    const doc = { ...data };

    // Set defaults
    if (!doc.status) doc.status = 'draft';
    if (!doc.priority) doc.priority = 'medium';
    if (!doc.timeline) doc.timeline = [];
    if (!doc.assignedMembers) doc.assignedMembers = [];

    // Generate CASE-YYYY-NNNN format caseId
    if (!doc.caseId) {
      const year = new Date().getFullYear();
      const countRes = await query('SELECT COUNT(*) FROM complaints');
      const count = parseInt(countRes.rows[0].count, 10);
      doc.caseId = `CASE-${year}-${String(count + 1).padStart(4, '0')}`;
    }

    // Set submission deadlines if status is submitted
    if (doc.status === 'submitted' && !doc.resolutionDeadline) {
      doc.submittedAt = new Date();
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 90);
      doc.resolutionDeadline = deadline;
    }

    return super.create(doc);
  }
}

const Complaint = new ComplaintModel();

export default Complaint;
