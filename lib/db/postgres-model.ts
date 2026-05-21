import { query } from './postgres';
import { v4 as uuidv4 } from 'uuid';

export { query };


// Helper to convert camelCase to snake_case
export function toSnakeCase(str: string): string {
  if (str === '_id') return 'id';
  if (str === 'encryptionIV') return 'encryption_iv';
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// Helper to convert snake_case to camelCase
export function toCamelCase(str: string): string {
  if (str === 'id') return '_id';
  if (str === 'encryption_iv') return 'encryptionIV';
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
}

// Map database row keys to camelCase document keys
export function mapRowToDoc<T = any>(row: any): T {
  if (!row) return null as any;
  const doc: any = {};
  for (const key of Object.keys(row)) {
    const docKey = toCamelCase(key);
    doc[docKey] = row[key];
  }
  return doc as T;
}

// Map document keys to snake_case database row keys
export function mapDocToRow(doc: any): any {
  if (!doc) return null;
  const row: any = {};
  for (const key of Object.keys(doc)) {
    if (key === '__v' || key === 'isLocked') continue; // Skip virtuals
    const rowKey = toSnakeCase(key);
    row[rowKey] = doc[key];
  }
  return row;
}

// Model instance with save() method
export class ModelInstance {
  [key: string]: any;
  private _tableName: string;

  constructor(tableName: string, data: any) {
    this._tableName = tableName;
    Object.assign(this, data);
  }

  async save(): Promise<this> {
    const rawData: any = { ...this };
    delete rawData._tableName;
    
    const id = rawData._id || rawData.id;
    if (!id) {
      throw new Error('Cannot save model instance without an ID');
    }

    const rowData = mapDocToRow(rawData);
    
    // Set updated_at
    rowData.updated_at = new Date();
    this.updatedAt = rowData.updated_at;

    const keys = Object.keys(rowData).filter(k => k !== 'id');
    const setClauses = keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');
    const values = [id, ...keys.map(k => {
      const val = rowData[k];
      if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
        return JSON.stringify(val);
      }
      return val;
    })];

    const sql = `
      UPDATE "${this._tableName}"
      SET ${setClauses}
      WHERE "id" = $1
      RETURNING *
    `;

    const res = await query(sql, values);
    if (res.rowCount === 0) {
      throw new Error(`Failed to save instance in ${this._tableName}: record not found`);
    }

    const updatedDoc = mapRowToDoc(res.rows[0]);
    Object.assign(this, updatedDoc);
    return this;
  }
}

export class PostgresQueryBuilder<T = any> {
  private tableName: string;
  private filter: any;
  private selectFields: string[] = [];
  private excludeFields: string[] = [];
  private sortClauses: string[] = [];
  private skipCount: number = 0;
  private limitCount: number = 0;
  private isLean: boolean = false;
  private isSingle: boolean = false;

  constructor(tableName: string, filter: any = {}, isSingle: boolean = false) {
    this.tableName = tableName;
    this.filter = filter;
    this.isSingle = isSingle;
    if (isSingle) {
      this.limitCount = 1;
    }
  }

  select(fields: string): this {
    if (fields) {
      // Handle "+passwordHash" select modifier or space-separated list
      const parts = fields.split(/\s+/).filter(Boolean);
      for (const p of parts) {
        if (p.startsWith('-')) {
          this.excludeFields.push(toSnakeCase(p.substring(1)));
        } else if (p.startsWith('+')) {
          this.selectFields.push(toSnakeCase(p.substring(1)));
        } else {
          this.selectFields.push(toSnakeCase(p));
        }
      }
    }
    return this;
  }

  sort(sortObj: any): this {
    if (typeof sortObj === 'object') {
      for (const [key, val] of Object.entries(sortObj)) {
        const dir = val === -1 || val === 'desc' || val === 'DESC' ? 'DESC' : 'ASC';
        this.sortClauses.push(`"${toSnakeCase(key)}" ${dir}`);
      }
    } else if (typeof sortObj === 'string') {
      const parts = sortObj.split(/\s+/).filter(Boolean);
      for (const p of parts) {
        if (p.startsWith('-')) {
          this.sortClauses.push(`"${toSnakeCase(p.substring(1))}" DESC`);
        } else {
          this.sortClauses.push(`"${toSnakeCase(p)}" ASC`);
        }
      }
    }
    return this;
  }

  skip(count: number): this {
    this.skipCount = count;
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  lean(): this {
    this.isLean = true;
    return this;
  }

  populate(arg1: any, arg2?: any): this {
    // NOP - for compatibility
    return this;
  }

  async exec(): Promise<any> {
    const { sql, values } = this.buildSelectQuery();
    const res = await query(sql, values);
    
    const docs = res.rows.map(row => {
      const doc = mapRowToDoc(row);
      if (this.excludeFields.length > 0) {
        for (const f of this.excludeFields) {
          const docKey = toCamelCase(f);
          delete doc[docKey];
          delete (doc as any)[f];
        }
      }
      if (this.isLean) {
        return doc;
      }
      return new ModelInstance(this.tableName, doc);
    });

    if (this.isSingle) {
      return docs.length > 0 ? docs[0] : null;
    }
    return docs;
  }

  // To support awaiting the builder itself (Promise-like)
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any): Promise<any> {
    return this.exec().then(onfulfilled, onrejected);
  }

  private buildSelectQuery(): { sql: string; values: any[] } {
    let selectStr = '*';
    if (this.selectFields.length > 0) {
      selectStr = this.selectFields.map(f => `"${f}"`).join(', ');
      // Always select id for instances
      if (!this.selectFields.includes('id')) {
        selectStr += ', "id"';
      }
    }

    const { whereClause, values } = this.buildWhereClause();
    let sql = `SELECT ${selectStr} FROM "${this.tableName}"`;
    if (whereClause) {
      sql += ` WHERE ${whereClause}`;
    }

    if (this.sortClauses.length > 0) {
      sql += ` ORDER BY ${this.sortClauses.join(', ')}`;
    }

    if (this.limitCount > 0) {
      sql += ` LIMIT ${this.limitCount}`;
    }

    if (this.skipCount > 0) {
      sql += ` OFFSET ${this.skipCount}`;
    }

    return { sql, values };
  }

  private buildWhereClause(): { whereClause: string; values: any[] } {
    const clauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const parseFilter = (obj: any, parentKey?: string) => {
      if (!obj || typeof obj !== 'object' || obj instanceof Date) {
        if (parentKey) {
          const colName = toSnakeCase(parentKey);
          clauses.push(`"${colName}" = $${paramIndex++}`);
          values.push(obj);
        }
        return;
      }

      for (const [key, val] of Object.entries(obj)) {
        if (key === '$or') {
          const orClauses: string[] = [];
          for (const orObj of val as any[]) {
            // Recurse and parse sub-filters
            const sub = this.parseSubFilter(orObj, values, paramIndex);
            if (sub.clause) {
              orClauses.push(sub.clause);
              paramIndex = sub.nextParamIndex;
            }
          }
          if (orClauses.length > 0) {
            clauses.push(`(${orClauses.join(' OR ')})`);
          }
        } else if (key === '$and') {
          const andClauses: string[] = [];
          for (const andObj of val as any[]) {
            const sub = this.parseSubFilter(andObj, values, paramIndex);
            if (sub.clause) {
              andClauses.push(sub.clause);
              paramIndex = sub.nextParamIndex;
            }
          }
          if (andClauses.length > 0) {
            clauses.push(`(${andClauses.join(' AND ')})`);
          }
        } else if (val && typeof val === 'object' && !(val instanceof Date)) {
          const colName = toSnakeCase(key);
          // Handle operator keys like $in, $ne, $regex
          const operators = Object.keys(val);
          for (const op of operators) {
            const opVal = (val as any)[op];
            if (op === '$in') {
              clauses.push(`"${colName}" = ANY($${paramIndex++})`);
              values.push(opVal);
            } else if (op === '$nin') {
              clauses.push(`NOT ("${colName}" = ANY($${paramIndex++}))`);
              values.push(opVal);
            } else if (op === '$ne') {
              clauses.push(`"${colName}" != $${paramIndex++}`);
              values.push(opVal);
            } else if (op === '$regex') {
              // Fuzzy case insensitive search
              clauses.push(`"${colName}" ILIKE $${paramIndex++}`);
              values.push(`%${opVal}%`);
            } else if (op === '$options') {
              // NOP: we handle standard 'i' as ILIKE
            } else if (op === '$gt') {
              clauses.push(`"${colName}" > $${paramIndex++}`);
              values.push(opVal);
            } else if (op === '$gte') {
              clauses.push(`"${colName}" >= $${paramIndex++}`);
              values.push(opVal);
            } else if (op === '$lt') {
              clauses.push(`"${colName}" < $${paramIndex++}`);
              values.push(opVal);
            } else if (op === '$lte') {
              clauses.push(`"${colName}" <= $${paramIndex++}`);
              values.push(opVal);
            }
          }
        } else {
          // Standard equality
          const colName = toSnakeCase(key);
          // Special case for array containing a value: if column is JSONB and val is simple, check if array contains
          if (['services', 'languages', 'specialization', 'tags'].includes(colName)) {
            clauses.push(`"${colName}" @> $${paramIndex++}::jsonb`);
            values.push(JSON.stringify(val));
          } else {
            clauses.push(`"${colName}" = $${paramIndex++}`);
            values.push(val);
          }
        }
      }
    };

    parseFilter(this.filter);
    return { whereClause: clauses.join(' AND '), values };
  }

  private parseSubFilter(filterObj: any, values: any[], startParamIndex: number) {
    const clauses: string[] = [];
    let paramIndex = startParamIndex;

    for (const [key, val] of Object.entries(filterObj)) {
      const colName = toSnakeCase(key);
      if (val && typeof val === 'object' && !(val instanceof Date)) {
        const operators = Object.keys(val);
        for (const op of operators) {
          const opVal = (val as any)[op];
          if (op === '$regex') {
            clauses.push(`"${colName}" ILIKE $${paramIndex++}`);
            values.push(`%${opVal}%`);
          } else if (op === '$in') {
            clauses.push(`"${colName}" = ANY($${paramIndex++})`);
            values.push(opVal);
          } else if (op === '$ne') {
            clauses.push(`"${colName}" != $${paramIndex++}`);
            values.push(opVal);
          }
        }
      } else {
        clauses.push(`"${colName}" = $${paramIndex++}`);
        values.push(val);
      }
    }

    return { clause: clauses.join(' AND '), nextParamIndex: paramIndex };
  }
}

// Base class for Postgres Models to match Mongoose Model API
export class PostgresModel<T = any> {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  find(filter: any = {}): PostgresQueryBuilder<T> {
    return new PostgresQueryBuilder<T>(this.tableName, filter, false);
  }

  findOne(filter: any = {}): PostgresQueryBuilder<T> & Promise<T | null> {
    return new PostgresQueryBuilder<T>(this.tableName, filter, true) as any;
  }

  findById(id: string): PostgresQueryBuilder<T> & Promise<T | null> {
    return this.findOne({ _id: id });
  }

  async create(data: any): Promise<T> {
    const doc = { ...data };
    
    // Generate a MongoDB-like or UUID-based primary key if not provided
    if (!doc._id && !doc.id) {
      doc._id = uuidv4().replace(/-/g, '').substring(0, 24); // 24-char hex string matching MongoDB ObjectID format!
    } else if (doc._id) {
      doc.id = doc._id;
    } else {
      doc._id = doc.id;
    }

    // Set timestamps
    doc.createdAt = doc.createdAt || new Date();
    doc.updatedAt = doc.updatedAt || new Date();

    const rowData = mapDocToRow(doc);
    const keys = Object.keys(rowData);
    const valuePlaceholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const values = keys.map(k => {
      const val = rowData[k];
      if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
        return JSON.stringify(val);
      }
      return val;
    });

    const sql = `
      INSERT INTO "${this.tableName}" (${keys.map(k => `"${k}"`).join(', ')})
      VALUES (${valuePlaceholders})
      RETURNING *
    `;

    const res = await query(sql, values);
    const createdDoc = mapRowToDoc(res.rows[0]);
    
    return new ModelInstance(this.tableName, createdDoc) as any;
  }

  async findByIdAndUpdate(id: string, update: any, options: any = {}): Promise<any> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const dataToUpdate = update.$set || update;
    Object.assign(existing, dataToUpdate);
    await (existing as any).save();

    if (existing) {
      (existing as any).lean = function() { return this; };
    }
    return existing;
  }

  async findOneAndUpdate(filter: any, update: any, options: any = {}): Promise<any> {
    const existing = await this.findOne(filter);
    if (!existing) return null;

    const dataToUpdate = update.$set || update;
    Object.assign(existing, dataToUpdate);
    await (existing as any).save();

    if (existing) {
      (existing as any).lean = function() { return this; };
    }
    return existing;
  }

  async updateOne(filter: any, update: any): Promise<{ modifiedCount: number }> {
    const existing = await this.findOne(filter);
    if (!existing) return { modifiedCount: 0 };

    const dataToUpdate = update.$set || update;
    Object.assign(existing, dataToUpdate);
    await (existing as any).save();
    return { modifiedCount: 1 };
  }

  async updateMany(filter: any, update: any): Promise<{ modifiedCount: number }> {
    const qb = new PostgresQueryBuilder<T>(this.tableName, filter);
    const results = await qb.exec();
    
    const dataToUpdate = update.$set || update;
    for (const doc of results) {
      Object.assign(doc, dataToUpdate);
      await doc.save();
    }

    return { modifiedCount: results.length };
  }

  async findByIdAndDelete(id: string): Promise<{ deletedCount: number }> {
    return this.deleteOne({ _id: id });
  }

  async deleteOne(filter: any): Promise<{ deletedCount: number }> {
    const existing = await this.findOne(filter);
    if (!existing) return { deletedCount: 0 };

    const id = (existing as any)._id;
    const sql = `DELETE FROM "${this.tableName}" WHERE "id" = $1`;
    await query(sql, [id]);

    return { deletedCount: 1 };
  }

  async deleteMany(filter: any = {}): Promise<{ deletedCount: number }> {
    const qb = new PostgresQueryBuilder<T>(this.tableName, filter);
    const results = await qb.exec();

    let deletedCount = 0;
    for (const doc of results) {
      const id = (doc as any)._id;
      const sql = `DELETE FROM "${this.tableName}" WHERE "id" = $1`;
      await query(sql, [id]);
      deletedCount++;
    }

    return { deletedCount };
  }

  async countDocuments(filter: any = {}): Promise<number> {
    const qb = new PostgresQueryBuilder<T>(this.tableName, filter);
    const { sql, values } = (qb as any).buildSelectQuery();
    
    // Replace SELECT ... FROM with SELECT COUNT(*) FROM
    const countSql = sql.replace(/SELECT .*? FROM/, 'SELECT COUNT(*) FROM').replace(/LIMIT \d+/, '').replace(/OFFSET \d+/, '');
    const res = await query(countSql, values);
    return parseInt(res.rows[0].count, 10);
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    // Helper to find the first Date object inside the pipeline for filtering
    const findFirstDate = (obj: any): Date | null => {
      if (!obj) return null;
      if (obj instanceof Date) return obj;
      if (typeof obj === 'object') {
        for (const val of Object.values(obj)) {
          const d = findFirstDate(val);
          if (d) return d;
        }
      }
      return null;
    };

    const filterDate = findFirstDate(pipeline) || new Date(0);
    const now = new Date();

    // Check which pipeline is being queried
    const tbl = this.tableName;

    // 1. Complaints by incidentType
    const isIncidentTypeGroup = pipeline.some(stage => 
      stage.$group && stage.$group._id === '$incidentType'
    );
    if (tbl === 'complaints' && isIncidentTypeGroup) {
      const sql = `
        SELECT incident_type AS "_id", COUNT(*)::int AS "count" 
        FROM complaints 
        WHERE created_at >= $1 AND status != 'draft' 
        GROUP BY incident_type 
        ORDER BY "count" DESC
      `;
      const res = await query(sql, [filterDate]);
      return res.rows;
    }

    // 2. Complaints by status
    const isStatusGroup = pipeline.some(stage => 
      stage.$group && stage.$group._id === '$status'
    );
    if (tbl === 'complaints' && isStatusGroup) {
      const sql = `
        SELECT status AS "_id", COUNT(*)::int AS "count" 
        FROM complaints 
        WHERE created_at >= $1 AND status != 'draft' 
        GROUP BY status
      `;
      const res = await query(sql, [filterDate]);
      return res.rows;
    }

    // 3. Complaints by priority
    const isPriorityGroup = pipeline.some(stage => 
      stage.$group && stage.$group._id === '$priority'
    );
    if (tbl === 'complaints' && isPriorityGroup) {
      const sql = `
        SELECT priority AS "_id", COUNT(*)::int AS "count" 
        FROM complaints 
        WHERE created_at >= $1 AND status != 'draft' 
        GROUP BY priority
      `;
      const res = await query(sql, [filterDate]);
      return res.rows;
    }

    // 4. Resolution outcomes
    const isResolutionOutcomeGroup = pipeline.some(stage => 
      stage.$group && stage.$group._id === '$resolution.outcome'
    );
    if (tbl === 'complaints' && isResolutionOutcomeGroup) {
      const sql = `
        SELECT (resolution::jsonb->>'outcome') AS "_id", COUNT(*)::int AS "count" 
        FROM complaints 
        WHERE status IN ('resolved', 'closed') AND (resolution::jsonb->>'outcome') IS NOT NULL 
        GROUP BY (resolution::jsonb->>'outcome')
      `;
      const res = await query(sql);
      return res.rows;
    }

    // 5. Monthly complaint trend
    const isMonthlyTrend = pipeline.some(stage => 
      stage.$group && stage.$group.submitted !== undefined
    );
    if (tbl === 'complaints' && isMonthlyTrend) {
      const sql = `
        SELECT 
          jsonb_build_object('year', EXTRACT(YEAR FROM created_at)::int, 'month', EXTRACT(MONTH FROM created_at)::int) AS "_id", 
          COUNT(*)::int AS "submitted", 
          SUM(CASE WHEN status IN ('resolved', 'closed') THEN 1 ELSE 0 END)::int AS "resolved" 
        FROM complaints 
        WHERE created_at >= $1 AND status != 'draft' 
        GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at) 
        ORDER BY EXTRACT(YEAR FROM created_at) ASC, EXTRACT(MONTH FROM created_at) ASC
      `;
      const res = await query(sql, [filterDate]);
      return res.rows;
    }

    // 6. Counseling stats
    if (tbl === 'counseling_sessions') {
      const sql = `
        SELECT 
          status AS "_id", 
          COUNT(*)::int AS "count", 
          COALESCE(AVG((feedback::jsonb->>'rating')::numeric), 0)::float AS "avgRating" 
        FROM counseling_sessions 
        WHERE created_at >= $1 
        GROUP BY status
      `;
      const res = await query(sql, [filterDate]);
      return res.rows;
    }

    // 7. User registration stats
    if (tbl === 'users') {
      const sql = `
        SELECT 
          jsonb_build_object('year', EXTRACT(YEAR FROM created_at)::int, 'month', EXTRACT(MONTH FROM created_at)::int, 'role', role) AS "_id", 
          COUNT(*)::int AS "count" 
        FROM users 
        WHERE created_at >= $1 
        GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at), role 
        ORDER BY EXTRACT(YEAR FROM created_at) ASC, EXTRACT(MONTH FROM created_at) ASC
      `;
      const res = await query(sql, [filterDate]);
      return res.rows;
    }

    // 8. Average resolution time
    const isAvgResolutionTime = pipeline.some(stage => 
      stage.$group && stage.$group.avgDays !== undefined
    );
    if (tbl === 'complaints' && isAvgResolutionTime) {
      const sql = `
        SELECT 
          NULL AS "_id", 
          COALESCE(AVG(EXTRACT(EPOCH FROM ((resolution::jsonb->>'resolvedAt')::timestamptz - created_at)) / 86400), 0)::float AS "avgDays", 
          COALESCE(MIN(EXTRACT(EPOCH FROM ((resolution::jsonb->>'resolvedAt')::timestamptz - created_at)) / 86400), 0)::float AS "minDays", 
          COALESCE(MAX(EXTRACT(EPOCH FROM ((resolution::jsonb->>'resolvedAt')::timestamptz - created_at)) / 86400), 0)::float AS "maxDays" 
        FROM complaints 
        WHERE status IN ('resolved', 'closed') AND (resolution::jsonb->>'resolvedAt') IS NOT NULL
      `;
      const res = await query(sql);
      return res.rows;
    }

    // 9. Compliance stats (Committees)
    if (tbl === 'committees') {
      const sql = `
        SELECT 
          type AS "_id", 
          COUNT(*)::int AS "total", 
          SUM(CASE WHEN has_external_member = true AND has_women_majority = true THEN 1 ELSE 0 END)::int AS "compliant", 
          SUM(CASE WHEN valid_until < $1 THEN 1 ELSE 0 END)::int AS "expired" 
        FROM committees 
        GROUP BY type
      `;
      const res = await query(sql, [now]);
      return res.rows;
    }

    return [];
  }
}

