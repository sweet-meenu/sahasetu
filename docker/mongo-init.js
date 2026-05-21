// MongoDB initialization script for Docker
db = db.getSiblingDB('sahasetu');

// Create collections with validation
db.createCollection('users');
db.createCollection('complaints');
db.createCollection('evidence');
db.createCollection('counselingsessions');
db.createCollection('partners');
db.createCollection('committees');
db.createCollection('auditlogs');

// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 }, { sparse: true });
db.users.createIndex({ role: 1 });

db.complaints.createIndex({ caseId: 1 }, { unique: true });
db.complaints.createIndex({ userId: 1 });
db.complaints.createIndex({ status: 1 });
db.complaints.createIndex({ assignedCommittee: 1 });
db.complaints.createIndex({ createdAt: -1 });

db.evidence.createIndex({ userId: 1 });
db.evidence.createIndex({ complaintId: 1 });

db.counselingsessions.createIndex({ userId: 1 });
db.counselingsessions.createIndex({ counselorId: 1 });
db.counselingsessions.createIndex({ scheduledAt: 1 });

db.partners.createIndex({ verified: 1 });
db.partners.createIndex({ location: '2dsphere' });
db.partners.createIndex({ services: 1 });

db.committees.createIndex({ organizationId: 1 });
db.committees.createIndex({ type: 1 });

db.auditlogs.createIndex({ userId: 1 });
db.auditlogs.createIndex({ createdAt: -1 });
db.auditlogs.createIndex({ action: 1 });

print('SaahasSetu database initialized successfully');
