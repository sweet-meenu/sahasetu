import { Pool, QueryResult } from 'pg';

const neonConnectionString = 'postgresql://neondb_owner:npg_wnvH1eukhdF5@ep-ancient-fire-aqdw9qs3-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const localConnectionString = 'postgresql://postgres@localhost:5432/postgres';

let pool: Pool;
let activeConnectionString = neonConnectionString;

async function testConnection(connString: string): Promise<boolean> {
  const testPool = new Pool({
    connectionString: connString,
    connectionTimeoutMillis: 3000,
    ssl: connString.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });
  try {
    const client = await testPool.connect();
    await client.query('SELECT 1;');
    client.release();
    await testPool.end();
    return true;
  } catch (err) {
    // console.warn(`Connection test failed for: ${connString.split('@')[1] || connString}`, err);
    await testPool.end();
    return false;
  }
}

export async function getDbPool(): Promise<Pool> {
  if (pool) return pool;

  console.log('🔌 Testing database connections...');
  const isNeonAvailable = await testConnection(neonConnectionString);
  
  if (isNeonAvailable) {
    console.log('🌐 Connected to Remote Neon PostgreSQL database.');
    activeConnectionString = neonConnectionString;
  } else {
    console.warn('⚠️ Neon remote database unreachable. Falling back to local PostgreSQL.');
    activeConnectionString = localConnectionString;
  }

  pool = new Pool({
    connectionString: activeConnectionString,
    ssl: activeConnectionString.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });

  return pool;
}

export async function query(text: string, params?: any[]): Promise<QueryResult<any>> {
  const dbPool = await getDbPool();
  const start = Date.now();
  try {
    const res = await dbPool.query(text, params);
    const duration = Date.now() - start;
    return res;
  } catch (error) {
    console.error('Postgres Query Error:', error, { text });
    throw error;
  }
}

export async function initDB() {
  console.log('🔄 Initializing PostgreSQL database tables...');
  
  try {
    // 1. Users Table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        organization TEXT,
        avatar TEXT,
        specialization JSONB DEFAULT '[]'::jsonb,
        languages JSONB DEFAULT '[]'::jsonb,
        rating NUMERIC DEFAULT 5.0,
        experience TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        anonymous_id TEXT UNIQUE NOT NULL,
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        last_login TIMESTAMP WITH TIME ZONE,
        login_attempts INTEGER DEFAULT 0,
        lock_until TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create role and anonymous_id indexes on users
    await query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_anonymous ON users(anonymous_id);`);

    // 2. Complaints Table
    await query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id VARCHAR(50) PRIMARY KEY,
        case_id TEXT UNIQUE NOT NULL,
        user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_anonymous BOOLEAN DEFAULT FALSE,
        incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
        incident_time TEXT,
        location TEXT,
        incident_type TEXT NOT NULL,
        description TEXT NOT NULL,
        perpetrator_info TEXT,
        witnesses TEXT,
        previous_incidents TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        priority TEXT NOT NULL DEFAULT 'medium',
        timeline JSONB DEFAULT '[]'::jsonb,
        assigned_committee VARCHAR(50),
        assigned_partner VARCHAR(50),
        assigned_members JSONB DEFAULT '[]'::jsonb,
        submitted_at TIMESTAMP WITH TIME ZONE,
        resolution_deadline TIMESTAMP WITH TIME ZONE,
        next_hearing_date TIMESTAMP WITH TIME ZONE,
        is_encrypted BOOLEAN DEFAULT TRUE,
        delayed_submission BOOLEAN DEFAULT FALSE,
        scheduled_submit_date TIMESTAMP WITH TIME ZONE,
        resolution TEXT,
        resolution_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_complaints_user_status ON complaints(user_id, status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_complaints_status_priority ON complaints(status, priority);`);

    // 3. Evidence Table
    await query(`
      CREATE TABLE IF NOT EXISTS evidence (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        complaint_id VARCHAR(50) REFERENCES complaints(id) ON DELETE SET NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        encrypted_path TEXT NOT NULL,
        encryption_iv TEXT NOT NULL,
        encryption_tag TEXT NOT NULL,
        encrypted_file_key TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'other',
        description TEXT,
        tags JSONB DEFAULT '[]'::jsonb,
        access_log JSONB DEFAULT '[]'::jsonb,
        shared_with JSONB DEFAULT '[]'::jsonb,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_evidence_user ON evidence(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_evidence_complaint ON evidence(complaint_id);`);

    // 4. Counseling Sessions Table
    await query(`
      CREATE TABLE IF NOT EXISTS counseling_sessions (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        counselor_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        complaint_id VARCHAR(50) REFERENCES complaints(id) ON DELETE SET NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled',
        scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
        duration INTEGER,
        started_at TIMESTAMP WITH TIME ZONE,
        ended_at TIMESTAMP WITH TIME ZONE,
        notes TEXT,
        feedback JSONB,
        voice_distortion BOOLEAN DEFAULT FALSE,
        is_anonymous BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON counseling_sessions(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_sessions_counselor ON counseling_sessions(counselor_id);`);

    // 5. Partners Table
    await query(`
      CREATE TABLE IF NOT EXISTS partners (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        registration_number TEXT,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        website TEXT,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pincode TEXT NOT NULL,
        coordinates JSONB,
        services JSONB DEFAULT '[]'::jsonb,
        specializations JSONB DEFAULT '[]'::jsonb,
        contact_person TEXT NOT NULL,
        team_size INTEGER,
        verified BOOLEAN DEFAULT FALSE,
        verified_at TIMESTAMP WITH TIME ZONE,
        verified_by VARCHAR(50),
        cases_handled INTEGER DEFAULT 0,
        rating NUMERIC,
        review_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        logo TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Committees Table
    await query(`
      CREATE TABLE IF NOT EXISTS committees (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        organization_name TEXT NOT NULL,
        organization_id VARCHAR(50),
        members JSONB DEFAULT '[]'::jsonb,
        district TEXT,
        state TEXT,
        constituted_on TIMESTAMP WITH TIME ZONE NOT NULL,
        valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
        is_constituted_as_per_act BOOLEAN DEFAULT FALSE,
        has_external_member BOOLEAN DEFAULT FALSE,
        has_women_majority BOOLEAN DEFAULT FALSE,
        email TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        partner_organizations JSONB DEFAULT '[]'::jsonb,
        total_cases INTEGER DEFAULT 0,
        resolved_cases INTEGER DEFAULT 0,
        pending_cases INTEGER DEFAULT 0,
        avg_resolution_days NUMERIC DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Audit Logs Table
    await query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        user_email TEXT,
        user_role TEXT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        description TEXT NOT NULL,
        metadata JSONB,
        ip_address TEXT,
        user_agent TEXT,
        severity TEXT NOT NULL DEFAULT 'info',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      ALTER TABLE audit_logs 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);`);

    // 8. Resources Table
    await query(`
      CREATE TABLE IF NOT EXISTS resources (
        id VARCHAR(50) PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        category TEXT NOT NULL,
        tags JSONB DEFAULT '[]'::jsonb,
        partner_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        partner_name TEXT NOT NULL,
        visibility TEXT NOT NULL DEFAULT 'public',
        status TEXT NOT NULL DEFAULT 'draft',
        download_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Notifications Table
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL DEFAULT 'general',
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        related_case_id TEXT,
        related_complaint_id VARCHAR(50) REFERENCES complaints(id) ON DELETE SET NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);`);

    console.log('✅ PostgreSQL database tables initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize database tables:', error);
    throw error;
  }
}
