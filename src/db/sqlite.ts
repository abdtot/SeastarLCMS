import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import {
  Client,
  LegalCase,
  Session,
  LegalDocument,
  FinancialRecord,
  LegalTask,
  LawyerMember,
  OfficeProfile,
  AppSettings,
  CourtInfo,
  PurchaseCode,
  AppLicense,
  UserAccount
} from '../types/index.ts';
import {
  INITIAL_CLIENTS,
  INITIAL_CASES,
  INITIAL_SESSIONS,
  INITIAL_DOCUMENTS,
  INITIAL_FINANCE,
  INITIAL_TASKS,
  INITIAL_COURTS,
  LAWYERS,
  DEFAULT_OFFICE,
  DEFAULT_SETTINGS
} from '../services/storage.ts';
import { DEFAULT_50_PURCHASE_CODES, normalizePurchaseCode } from '../services/purchaseCodes.ts';

const require = createRequire(import.meta.url);
const { DatabaseSync } = require('node:sqlite');

const DB_FILE_PATH = path.resolve(process.cwd(), 'seastar.sqlite');

let dbInstance: any = null;

export function getDb() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_FILE_PATH);
    initSchema(dbInstance);
  }
  return dbInstance;
}

export function closeDb() {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // ignore
    }
    dbInstance = null;
  }
}

function initSchema(db: any) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      national_id TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      client_role TEXT,
      company_name TEXT,
      portal_token TEXT,
      created_at TEXT,
      poas_count INTEGER DEFAULT 0,
      raw_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      case_number TEXT NOT NULL,
      general_registration_number TEXT,
      year INTEGER,
      court TEXT,
      circuit TEXT,
      judge_name TEXT,
      case_type TEXT,
      litigation_stage TEXT,
      status TEXT,
      claim_amount REAL DEFAULT 0,
      client_id TEXT,
      client_name TEXT,
      client_role TEXT,
      opponent_name TEXT,
      opponent_lawyer TEXT,
      assigned_lawyer_id TEXT,
      assigned_lawyer_name TEXT,
      description TEXT,
      created_at TEXT,
      updated_at TEXT,
      raw_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      case_id TEXT,
      case_number TEXT,
      case_title TEXT,
      client_id TEXT,
      client_name TEXT,
      court TEXT,
      hall TEXT,
      date TEXT,
      time TEXT,
      session_type TEXT,
      requirements TEXT,
      status TEXT,
      decision_notes TEXT,
      next_session_date TEXT,
      raw_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT,
      case_id TEXT,
      case_number TEXT,
      client_id TEXT,
      client_name TEXT,
      upload_date TEXT,
      file_size TEXT,
      file_size_bytes INTEGER DEFAULT 0,
      file_name TEXT,
      mime_type TEXT,
      file_data_uri TEXT,
      file_blob BLOB,
      confidentiality TEXT,
      notes TEXT,
      raw_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS finance (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      voucher_number TEXT NOT NULL,
      case_id TEXT,
      case_number TEXT,
      client_id TEXT,
      client_name TEXT,
      amount REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      total_with_tax REAL DEFAULT 0,
      payment_method TEXT,
      date TEXT,
      description TEXT,
      category TEXT,
      paid_status TEXT,
      recipient_or_payer_name TEXT,
      raw_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      case_id TEXT,
      case_number TEXT,
      assigned_to_id TEXT,
      assigned_to_name TEXT,
      assigned_role TEXT,
      due_date TEXT,
      priority TEXT,
      status TEXT,
      progress_percentage INTEGER DEFAULT 0,
      created_at TEXT,
      raw_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lawyers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      email TEXT,
      phone TEXT,
      avatar_color TEXT,
      raw_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS courts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      city TEXT,
      address TEXT,
      default_circuit TEXT,
      chief_judge TEXT,
      secretary_phone TEXT,
      working_hours TEXT,
      notes TEXT,
      created_at TEXT,
      raw_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS purchase_codes (
      code TEXT PRIMARY KEY,
      is_used INTEGER DEFAULT 0,
      used_at TEXT,
      used_by_email TEXT,
      used_by_name TEXT,
      firm_name TEXT
    );

    CREATE TABLE IF NOT EXISTS app_license (
      id TEXT PRIMARY KEY,
      is_activated INTEGER DEFAULT 0,
      license_code TEXT,
      activated_at TEXT,
      licensee_name TEXT,
      licensee_email TEXT,
      firm_name TEXT,
      license_number TEXT,
      raw_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      firm_name TEXT,
      license_number TEXT,
      city TEXT,
      password_hash TEXT,
      role TEXT DEFAULT 'admin',
      created_at TEXT NOT NULL,
      raw_json TEXT NOT NULL
    );
  `);

  // Ensure binary columns exist on documents table if migrating from older schema
  const alterCols = [
    'ALTER TABLE documents ADD COLUMN file_size_bytes INTEGER DEFAULT 0',
    'ALTER TABLE documents ADD COLUMN mime_type TEXT',
    'ALTER TABLE documents ADD COLUMN file_data_uri TEXT',
    'ALTER TABLE documents ADD COLUMN file_blob BLOB',
  ];
  for (const sql of alterCols) {
    try {
      db.exec(sql);
    } catch {
      // Column already exists
    }
  }

  // Populate 50 purchase codes if not yet populated
  const codeCountRow = db.prepare(`SELECT COUNT(*) as count FROM purchase_codes`).get() as { count: number };
  if (!codeCountRow || codeCountRow.count === 0) {
    const insertCode = db.prepare(`
      INSERT OR IGNORE INTO purchase_codes (code, is_used) VALUES (?, 0)
    `);
    db.exec('BEGIN IMMEDIATE TRANSACTION');
    try {
      for (const c of DEFAULT_50_PURCHASE_CODES) {
        insertCode.run(c);
      }
      db.exec('COMMIT');
    } catch {
      db.exec('ROLLBACK');
    }
  }

  // Ensure courts are populated
  const courtsCount = db.prepare(`SELECT COUNT(*) as c FROM courts`).get() as { c: number };
  if (!courtsCount || courtsCount.c === 0) {
    saveCourtsToSqlite(INITIAL_COURTS, db);
  }
}

export function seedDatabaseWithDefaults(db = getDb()) {
  // Clean default data: zero dummy clients, cases, sessions, documents, finance, tasks
  saveClientsToSqlite([], db);
  saveCasesToSqlite([], db);
  saveSessionsToSqlite([], db);
  saveDocumentsToSqlite([], db);
  saveFinanceToSqlite([], db);
  saveTasksToSqlite([], db);
  saveCourtsToSqlite(INITIAL_COURTS, db);
  saveKeyValue('app_settings', DEFAULT_SETTINGS, db);
  saveKeyValue('db_seeded', { seededAt: new Date().toISOString() }, db);
}

export function saveClientsToSqlite(clients: Client[], db = getDb()) {
  db.exec('BEGIN IMMEDIATE TRANSACTION');
  try {
    db.exec('DELETE FROM clients');
    const stmt = db.prepare(`
      INSERT INTO clients (
        id, full_name, national_id, phone, email, address,
        client_role, company_name, portal_token, created_at, poas_count, raw_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of clients) {
      stmt.run(
        c.id,
        c.fullName || '',
        c.nationalId || '',
        c.phone || '',
        c.email || '',
        c.address || '',
        c.clientRole || 'مدعي',
        c.companyName || '',
        c.portalToken || '',
        c.createdAt || '',
        Array.isArray(c.poas) ? c.poas.length : 0,
        JSON.stringify(c)
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function saveCasesToSqlite(cases: LegalCase[], db = getDb()) {
  db.exec('BEGIN IMMEDIATE TRANSACTION');
  try {
    db.exec('DELETE FROM cases');
    const stmt = db.prepare(`
      INSERT INTO cases (
        id, case_number, general_registration_number, year, court, circuit,
        judge_name, case_type, litigation_stage, status, claim_amount,
        client_id, client_name, client_role, opponent_name, opponent_lawyer,
        assigned_lawyer_id, assigned_lawyer_name, description, created_at, updated_at, raw_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of cases) {
      stmt.run(
        c.id,
        c.caseNumber || '',
        c.generalRegistrationNumber || '',
        c.year || 1446,
        c.court || '',
        c.circuit || '',
        c.judgeName || '',
        c.caseType || '',
        c.litigationStage || 'ابتدائي',
        c.status || 'جارية',
        c.claimAmount ?? 0,
        c.clientId || '',
        c.clientName || '',
        c.clientRole || 'مدعي',
        c.opponentName || '',
        c.opponentLawyer || '',
        c.assignedLawyerId || '',
        c.assignedLawyerName || '',
        c.description || '',
        c.createdAt || '',
        c.updatedAt || '',
        JSON.stringify(c)
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function saveSessionsToSqlite(sessions: Session[], db = getDb()) {
  db.exec('BEGIN IMMEDIATE TRANSACTION');
  try {
    db.exec('DELETE FROM sessions');
    const stmt = db.prepare(`
      INSERT INTO sessions (
        id, case_id, case_number, case_title, client_id, client_name,
        court, hall, date, time, session_type, requirements,
        status, decision_notes, next_session_date, raw_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of sessions) {
      stmt.run(
        s.id,
        s.caseId || '',
        s.caseNumber || '',
        s.caseTitle || '',
        s.clientId || '',
        s.clientName || '',
        s.court || '',
        s.hall || '',
        s.date || '',
        s.time || '',
        s.sessionType || 'مرافعة',
        s.requirements || '',
        s.status || 'scheduled',
        s.decisionNotes || '',
        s.nextSessionDate || '',
        JSON.stringify(s)
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function buildSynthesizedLegalHtmlBuffer(d: LegalDocument): {
  buffer: Buffer;
  mimeType: string;
  dataUri: string;
} {
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>${d.title}</title>
  <style>
    body { font-family: 'Cairo', 'Traditional Arabic', Tahoma, sans-serif; padding: 36px; color: #0f172a; line-height: 1.8; background: #f8fafc; }
    .sheet { max-width: 780px; margin: 0 auto; background: #ffffff; border: 2px solid #cbd5e1; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .badge { background: #e0e7ff; color: #1e3a8a; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: bold; }
    h1 { font-size: 20px; color: #1e3a8a; margin: 0 0 8px 0; }
    .meta { background: #f1f5f9; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; font-size: 14px; }
    .content { font-size: 15px; white-space: pre-wrap; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; min-height: 180px; }
    .footer { margin-top: 28px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <h1>${d.title}</h1>
        <div>تصنيف الوثيقة: <strong>${d.type || 'مستند قضائي'}</strong></div>
      </div>
      <span class="badge">مستوى السرية: ${d.confidentiality || 'عام'}</span>
    </div>
    <div class="meta">
      <div><strong>اسم الملف المرجعي:</strong> ${d.fileName}</div>
      <div><strong>تاريخ الإيداع والأرشفة:</strong> ${d.uploadDate}</div>
      ${d.caseNumber ? `<div><strong>رقم القضية المرتبطة:</strong> #${d.caseNumber}</div>` : ''}
      ${d.clientName ? `<div><strong>الموكل المعني:</strong> ${d.clientName}</div>` : ''}
    </div>
    <div class="content">${d.notes || 'مستند قضائي مؤرشف رسمياً في قاعدة بيانات مكتب المحاماة (SQLite).'}</div>
    <div class="footer">وثيقة مؤرشفة رقمياً في قاعدة بيانات SQLite — نظام SeaStar لإدارة مكاتب المحاماة</div>
  </div>
</body>
</html>`;
  const buffer = Buffer.from(html, 'utf-8');
  const mimeType = 'text/html; charset=utf-8';
  const dataUri = `data:text/html;base64,${buffer.toString('base64')}`;
  return { buffer, mimeType, dataUri };
}

function parseDataUriToBuffer(
  dataUri: string | undefined,
  fallbackDoc: LegalDocument
): { buffer: Buffer; mimeType: string; dataUri: string; sizeBytes: number } {
  if (dataUri && dataUri.startsWith('data:')) {
    const commaIdx = dataUri.indexOf(',');
    if (commaIdx !== -1) {
      const header = dataUri.slice(5, commaIdx);
      const base64Part = dataUri.slice(commaIdx + 1);
      const mimeType = header.split(';')[0] || 'application/octet-stream';
      const buffer = Buffer.from(base64Part, 'base64');
      return {
        buffer,
        mimeType,
        dataUri,
        sizeBytes: buffer.length,
      };
    }
  }
  const synth = buildSynthesizedLegalHtmlBuffer(fallbackDoc);
  return {
    buffer: synth.buffer,
    mimeType: synth.mimeType,
    dataUri: synth.dataUri,
    sizeBytes: synth.buffer.length,
  };
}

export function saveDocumentsToSqlite(docs: LegalDocument[], db = getDb()) {
  // Preserve existing binary blobs in SQLite if incoming metadata array omits fileDataUri
  const existingRows = db
    .prepare(`SELECT id, mime_type, file_size_bytes, file_data_uri, file_blob, file_name FROM documents`)
    .all() as {
    id: string;
    mime_type: string | null;
    file_size_bytes: number | null;
    file_data_uri: string | null;
    file_blob: Uint8Array | null;
    file_name: string | null;
  }[];
  const existingMap = new Map(existingRows.map((r) => [r.id, r]));

  db.exec('BEGIN IMMEDIATE TRANSACTION');
  try {
    const stmt = db.prepare(`
      INSERT INTO documents (
        id, title, type, case_id, case_number, client_id, client_name,
        upload_date, file_size, file_size_bytes, file_name, mime_type,
        file_data_uri, file_blob, confidentiality, notes, raw_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        type = excluded.type,
        case_id = excluded.case_id,
        case_number = excluded.case_number,
        client_id = excluded.client_id,
        client_name = excluded.client_name,
        upload_date = excluded.upload_date,
        file_size = excluded.file_size,
        file_size_bytes = excluded.file_size_bytes,
        file_name = excluded.file_name,
        mime_type = excluded.mime_type,
        file_data_uri = COALESCE(excluded.file_data_uri, documents.file_data_uri),
        file_blob = COALESCE(excluded.file_blob, documents.file_blob),
        confidentiality = excluded.confidentiality,
        notes = excluded.notes,
        raw_json = excluded.raw_json
    `);

    for (const d of docs) {
      const prev = existingMap.get(d.id);
      let buffer: Buffer | Uint8Array | null = null;
      let mimeType: string = d.mimeType || prev?.mime_type || 'application/octet-stream';
      let dataUri: string | null = null;
      let sizeBytes: number = d.fileSizeBytes || prev?.file_size_bytes || 0;

      if (d.fileDataUri && d.fileDataUri.startsWith('data:')) {
        const parsed = parseDataUriToBuffer(d.fileDataUri, d);
        buffer = parsed.buffer;
        mimeType = d.mimeType || parsed.mimeType;
        dataUri = parsed.dataUri;
        sizeBytes = parsed.sizeBytes;
      } else if (prev && prev.file_blob && prev.file_blob.byteLength > 0) {
        buffer = prev.file_blob;
        mimeType = prev.mime_type || mimeType;
        dataUri = prev.file_data_uri;
        sizeBytes = prev.file_size_bytes || prev.file_blob.byteLength;
      } else {
        const parsed = parseDataUriToBuffer(undefined, d);
        buffer = parsed.buffer;
        mimeType = d.mimeType || parsed.mimeType;
        dataUri = parsed.dataUri;
        sizeBytes = parsed.sizeBytes;
      }

      const metaDoc: LegalDocument = {
        ...d,
        mimeType,
        fileSizeBytes: sizeBytes,
        hasStoredBlob: true,
        fileDataUri: undefined,
      };

      stmt.run(
        d.id,
        d.title || '',
        d.type || 'أخرى',
        d.caseId || '',
        d.caseNumber || '',
        d.clientId || '',
        d.clientName || '',
        d.uploadDate || '',
        d.fileSize || `${Math.max(1, Math.round(sizeBytes / 1024))} KB`,
        sizeBytes,
        d.fileName || prev?.file_name || 'document.pdf',
        mimeType,
        dataUri,
        buffer,
        d.confidentiality || 'عام / سكرتارية',
        d.notes || '',
        JSON.stringify(metaDoc)
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function saveDocumentBinaryDirectly(
  docData: Partial<LegalDocument>,
  rawBuffer?: Buffer,
  originalFileName?: string,
  detectedMimeType?: string,
  db = getDb()
): LegalDocument {
  const docId = docData.id || `doc-${Date.now()}`;
  const nowStr = new Date().toISOString().split('T')[0];

  let buffer: Buffer;
  let mimeType: string;
  let dataUri: string;
  let sizeBytes: number;
  let fileName: string = originalFileName || docData.fileName || `${(docData.title || 'document').replace(/\s+/g, '_')}.pdf`;

  if (rawBuffer && Buffer.isBuffer(rawBuffer) && rawBuffer.length > 0) {
    buffer = rawBuffer;
    sizeBytes = rawBuffer.length;
    mimeType = detectedMimeType || docData.mimeType || 'application/octet-stream';
    if (sizeBytes <= 8 * 1024 * 1024) {
      dataUri = `data:${mimeType.split(';')[0]};base64,${buffer.toString('base64')}`;
    } else {
      dataUri = '';
    }
  } else if (docData.fileDataUri && docData.fileDataUri.startsWith('data:')) {
    const parsed = parseDataUriToBuffer(docData.fileDataUri, docData as LegalDocument);
    buffer = parsed.buffer;
    sizeBytes = parsed.sizeBytes;
    mimeType = detectedMimeType || docData.mimeType || parsed.mimeType;
    dataUri = parsed.dataUri;
  } else {
    const synth = buildSynthesizedLegalHtmlBuffer(docData as LegalDocument);
    buffer = synth.buffer;
    sizeBytes = synth.buffer.length;
    mimeType = synth.mimeType;
    dataUri = synth.dataUri;
    if (!originalFileName && !docData.fileName) {
      fileName = `${(docData.title || 'مستند_قضائي').replace(/\s+/g, '_')}.html`;
    }
  }

  const formattedSize =
    docData.fileSize ||
    (sizeBytes >= 1024 * 1024
      ? `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.max(1, Math.round(sizeBytes / 1024))} KB`);

  const metaDoc: LegalDocument = {
    id: docId,
    title: docData.title || 'مستند قضائي',
    type: docData.type || 'أخرى',
    caseId: docData.caseId || '',
    caseNumber: docData.caseNumber || '',
    clientId: docData.clientId || '',
    clientName: docData.clientName || '',
    uploadDate: docData.uploadDate || nowStr,
    fileName,
    fileSize: formattedSize,
    fileSizeBytes: sizeBytes,
    mimeType,
    hasStoredBlob: true,
    confidentiality: docData.confidentiality || 'عام / سكرتارية',
    notes: docData.notes || '',
    tags: Array.isArray(docData.tags) ? docData.tags : [docData.type || 'مستند'],
    fileDataUri: undefined,
  };

  const stmt = db.prepare(`
    INSERT INTO documents (
      id, title, type, case_id, case_number, client_id, client_name,
      upload_date, file_size, file_size_bytes, file_name, mime_type,
      file_data_uri, file_blob, confidentiality, notes, raw_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      type = excluded.type,
      case_id = excluded.case_id,
      case_number = excluded.case_number,
      client_id = excluded.client_id,
      client_name = excluded.client_name,
      upload_date = excluded.upload_date,
      file_size = excluded.file_size,
      file_size_bytes = excluded.file_size_bytes,
      file_name = excluded.file_name,
      mime_type = excluded.mime_type,
      file_data_uri = excluded.file_data_uri,
      file_blob = excluded.file_blob,
      confidentiality = excluded.confidentiality,
      notes = excluded.notes,
      raw_json = excluded.raw_json
  `);

  stmt.run(
    metaDoc.id,
    metaDoc.title,
    metaDoc.type,
    metaDoc.caseId,
    metaDoc.caseNumber,
    metaDoc.clientId,
    metaDoc.clientName,
    metaDoc.uploadDate,
    metaDoc.fileSize,
    sizeBytes,
    metaDoc.fileName,
    mimeType,
    dataUri,
    buffer,
    metaDoc.confidentiality,
    metaDoc.notes,
    JSON.stringify(metaDoc)
  );

  return {
    ...metaDoc,
    fileDataUri: dataUri || undefined,
  };
}

export function upsertDocumentWithBinaryInSqlite(doc: LegalDocument, db = getDb()): LegalDocument {
  return saveDocumentBinaryDirectly(doc, undefined, doc.fileName, doc.mimeType, db);
}

export function getDocumentWithBinaryFromSqlite(
  id: string,
  db = getDb()
): {
  document: LegalDocument;
  buffer: Buffer;
  mimeType: string;
  fileName: string;
} | null {
  const row = db
    .prepare(
      `SELECT id, file_name, mime_type, file_size_bytes, file_data_uri, file_blob, raw_json FROM documents WHERE id = ?`
    )
    .get(id) as
    | {
        id: string;
        file_name: string;
        mime_type: string | null;
        file_size_bytes: number | null;
        file_data_uri: string | null;
        file_blob: Uint8Array | null;
        raw_json: string;
      }
    | undefined;

  if (!row) return null;

  const docMeta: LegalDocument = JSON.parse(row.raw_json);
  let buffer: Buffer;
  let mimeType = row.mime_type || docMeta.mimeType || 'text/html; charset=utf-8';
  let dataUri = row.file_data_uri || docMeta.fileDataUri;

  if (row.file_blob && row.file_blob.byteLength > 0) {
    buffer = Buffer.from(row.file_blob);
    if (!dataUri) {
      dataUri = `data:${mimeType.split(';')[0]};base64,${buffer.toString('base64')}`;
    }
  } else if (dataUri && dataUri.startsWith('data:')) {
    const parsed = parseDataUriToBuffer(dataUri, docMeta);
    buffer = parsed.buffer;
    mimeType = parsed.mimeType;
  } else {
    const synth = buildSynthesizedLegalHtmlBuffer(docMeta);
    buffer = synth.buffer;
    mimeType = synth.mimeType;
    dataUri = synth.dataUri;
  }

  return {
    document: {
      ...docMeta,
      mimeType,
      fileSizeBytes: buffer.length,
      hasStoredBlob: true,
      fileDataUri: dataUri,
    },
    buffer,
    mimeType,
    fileName: row.file_name || docMeta.fileName || 'document.html',
  };
}

export function deleteDocumentFromSqlite(id: string, db = getDb()): void {
  db.prepare(`DELETE FROM documents WHERE id = ?`).run(id);
}

export function saveFinanceToSqlite(records: FinancialRecord[], db = getDb()) {
  db.exec('BEGIN IMMEDIATE TRANSACTION');
  try {
    db.exec('DELETE FROM finance');
    const stmt = db.prepare(`
      INSERT INTO finance (
        id, type, voucher_number, case_id, case_number, client_id, client_name,
        amount, tax_amount, total_with_tax, payment_method, date,
        description, category, paid_status, recipient_or_payer_name, raw_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const f of records) {
      stmt.run(
        f.id,
        f.type || 'receipt_voucher',
        f.voucherNumber || '',
        f.caseId || '',
        f.caseNumber || '',
        f.clientId || '',
        f.clientName || '',
        f.amount ?? 0,
        f.taxAmount ?? 0,
        f.totalWithTax ?? 0,
        f.paymentMethod || 'نقدي',
        f.date || '',
        f.description || '',
        f.category || 'أتعاب محاماة',
        f.paidStatus || 'paid',
        f.recipientOrPayerName || '',
        JSON.stringify(f)
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function saveTasksToSqlite(tasks: LegalTask[], db = getDb()) {
  db.exec('BEGIN IMMEDIATE TRANSACTION');
  try {
    db.exec('DELETE FROM tasks');
    const stmt = db.prepare(`
      INSERT INTO tasks (
        id, title, description, case_id, case_number, assigned_to_id,
        assigned_to_name, assigned_role, due_date, priority, status,
        progress_percentage, created_at, raw_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const t of tasks) {
      stmt.run(
        t.id,
        t.title || '',
        t.description || '',
        t.caseId || '',
        t.caseNumber || '',
        t.assignedToId || '',
        t.assignedToName || '',
        t.assignedRole || '',
        t.dueDate || '',
        t.priority || 'عادية',
        t.status || 'pending',
        t.progressPercentage ?? 0,
        t.createdAt || '',
        JSON.stringify(t)
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function saveLawyersToSqlite(lawyers: LawyerMember[], db = getDb()) {
  db.exec('BEGIN IMMEDIATE TRANSACTION');
  try {
    db.exec('DELETE FROM lawyers');
    const stmt = db.prepare(`
      INSERT INTO lawyers (id, name, role, email, phone, avatar_color, raw_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const l of lawyers) {
      stmt.run(
        l.id,
        l.name || '',
        l.role || '',
        l.email || '',
        l.phone || '',
        l.avatarColor || 'bg-blue-600',
        JSON.stringify(l)
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function saveCourtsToSqlite(courts: CourtInfo[], db = getDb()) {
  db.exec('BEGIN IMMEDIATE TRANSACTION');
  try {
    db.exec('DELETE FROM courts');
    const stmt = db.prepare(`
      INSERT INTO courts (
        id, name, type, city, address, default_circuit,
        chief_judge, secretary_phone, working_hours, notes, created_at, raw_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const ct of courts) {
      stmt.run(
        ct.id,
        ct.name || '',
        ct.type || 'تجارية',
        ct.city || '',
        ct.address || '',
        ct.defaultCircuit || '',
        ct.chiefJudge || '',
        ct.secretaryPhone || '',
        ct.workingHours || '',
        ct.notes || '',
        ct.createdAt || '',
        JSON.stringify(ct)
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function saveKeyValue(key: string, value: any, db = getDb()) {
  const stmt = db.prepare(`
    INSERT INTO kv_store (key, value_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value_json = excluded.value_json,
      updated_at = excluded.updated_at
  `);
  stmt.run(key, JSON.stringify(value), new Date().toISOString());
}

export function getKeyValue<T>(key: string, fallback: T, db = getDb()): T {
  const row = db.prepare(`SELECT value_json FROM kv_store WHERE key = ?`).get(key) as { value_json: string } | undefined;
  if (!row) return fallback;
  try {
    return JSON.parse(row.value_json);
  } catch {
    return fallback;
  }
}

function readJsonRows<T>(tableName: string, db = getDb()): T[] {
  const rows = db.prepare(`SELECT raw_json FROM ${tableName}`).all() as { raw_json: string }[];
  return rows.map((r) => JSON.parse(r.raw_json));
}

export function getSqliteStats(db = getDb()) {
  const versionRow = db.prepare('SELECT sqlite_version() as version').get() as { version: string };
  const journalRow = db.prepare('PRAGMA journal_mode').get() as { journal_mode: string };

  let fileSizeBytes = 0;
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      fileSizeBytes = fs.statSync(DB_FILE_PATH).size;
    }
  } catch {
    // ignore
  }

  const tables = ['cases', 'clients', 'sessions', 'finance', 'documents', 'tasks', 'lawyers', 'courts'];
  const tableCounts: Record<string, number> = {};
  for (const t of tables) {
    const row = db.prepare(`SELECT COUNT(*) as count FROM ${t}`).get() as { count: number };
    tableCounts[t] = row?.count ?? 0;
  }

  return {
    engine: 'SQLite 3 (Node Native SQLite)',
    sqliteVersion: versionRow?.version || '3.51',
    journalMode: (journalRow?.journal_mode || 'wal').toUpperCase(),
    dbFileName: 'seastar.sqlite',
    fileSizeBytes,
    fileSizeKB: (fileSizeBytes / 1024).toFixed(1),
    tableCounts,
    lastCheckedAt: new Date().toISOString(),
  };
}

export function getAllBootstrapData() {
  const db = getDb();
  return {
    clients: readJsonRows<Client>('clients', db),
    cases: readJsonRows<LegalCase>('cases', db),
    sessions: readJsonRows<Session>('sessions', db),
    documents: readJsonRows<LegalDocument>('documents', db),
    finance: readJsonRows<FinancialRecord>('finance', db),
    tasks: readJsonRows<LegalTask>('tasks', db),
    lawyers: readJsonRows<LawyerMember>('lawyers', db),
    courts: readJsonRows<CourtInfo>('courts', db),
    office: getKeyValue<OfficeProfile>('office_profile', DEFAULT_OFFICE, db),
    settings: getKeyValue<AppSettings>('app_settings', DEFAULT_SETTINGS, db),
    license: getAppLicenseFromSqlite(db),
    user: getUserAccountFromSqlite(db),
    sqliteStats: getSqliteStats(db),
  };
}

export function executeReadQuery(sqlQuery: string) {
  const db = getDb();
  const trimmed = sqlQuery.trim();
  const upper = trimmed.toUpperCase();
  if (!upper.startsWith('SELECT') && !upper.startsWith('PRAGMA')) {
    throw new Error('يُسمح فقط باستعلامات القراءة (SELECT أو PRAGMA) للحفاظ على سلامة قاعدة البيانات.');
  }
  const stmt = db.prepare(trimmed);
  const rows = stmt.all();
  // Remove raw_json and binary/base64 columns from preview if present to keep table clean
  const cleanRows = rows.map((r: any) => {
    const copy = { ...r };
    delete copy.raw_json;
    delete copy.file_data_uri;
    if (copy.file_blob) {
      copy.file_blob = `[SQLite BLOB: ${copy.file_blob.byteLength || copy.file_size_bytes || 0} bytes]`;
    }
    return copy;
  });
  return cleanRows;
}

export function exportSqliteFileBuffer(): Buffer {
  const db = getDb();
  try {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
  } catch {
    // ignore
  }
  return fs.readFileSync(DB_FILE_PATH);
}

export function importSqliteFileBuffer(buffer: Buffer): boolean {
  const header = buffer.subarray(0, 15).toString('utf-8');
  if (!header.startsWith('SQLite format 3')) {
    return false;
  }
  closeDb();
  // Remove old WAL/SHM files if they exist
  if (fs.existsSync(`${DB_FILE_PATH}-wal`)) fs.unlinkSync(`${DB_FILE_PATH}-wal`);
  if (fs.existsSync(`${DB_FILE_PATH}-shm`)) fs.unlinkSync(`${DB_FILE_PATH}-shm`);
  fs.writeFileSync(DB_FILE_PATH, buffer);
  getDb();
  return true;
}

export function resetSqliteDatabase(mode: 'demo' | 'empty') {
  const db = getDb();
  if (mode === 'empty') {
    saveClientsToSqlite([], db);
    saveCasesToSqlite([], db);
    saveSessionsToSqlite([], db);
    saveDocumentsToSqlite([], db);
    saveFinanceToSqlite([], db);
    saveTasksToSqlite([], db);
    saveKeyValue('db_seeded', { seededAt: new Date().toISOString(), mode: 'empty' }, db);
  } else {
    seedDatabaseWithDefaults(db);
  }
  try {
    db.exec('VACUUM;');
  } catch {
    // ignore
  }
}

export function getPurchaseCodesFromSqlite(db = getDb()): PurchaseCode[] {
  const rows = db.prepare(`
    SELECT code, is_used, used_at, used_by_email, used_by_name, firm_name
    FROM purchase_codes
    ORDER BY is_used ASC, code ASC
  `).all() as {
    code: string;
    is_used: number;
    used_at: string | null;
    used_by_email: string | null;
    used_by_name: string | null;
    firm_name: string | null;
  }[];

  return rows.map((r) => ({
    code: r.code,
    isUsed: Boolean(r.is_used),
    usedAt: r.used_at || undefined,
    usedByEmail: r.used_by_email || undefined,
    usedByName: r.used_by_name || undefined,
    firmName: r.firm_name || undefined,
  }));
}

export function verifyPurchaseCodeInSqlite(
  rawCode: string,
  db = getDb()
): { ok: boolean; message: string; isUsed?: boolean; normalizedCode?: string } {
  const norm = normalizePurchaseCode(rawCode);
  if (!norm) {
    return { ok: false, message: 'يرجى إدخال كود الشراء' };
  }

  const row = db.prepare(`
    SELECT code, is_used, used_at, used_by_email, used_by_name
    FROM purchase_codes
    WHERE code = ?
  `).get(norm) as { code: string; is_used: number; used_at: string | null } | undefined;

  if (!row) {
    return {
      ok: false,
      message: 'كود الشراء غير صالح. يرجى التحقق من صحة الأحرف أو التواصل مع الدعم الفني.',
    };
  }

  if (row.is_used === 1) {
    return {
      ok: false,
      isUsed: true,
      message: `كود الشراء هذا تم استخدامه وتفعيله مسبقاً بتاريخ (${row.used_at || 'سابق'}). كل كود شراء صالح للتفعيل مرة واحدة فقط.`,
    };
  }

  return {
    ok: true,
    message: 'كود الشراء صالح ومتاح للتفعيل الفوري!',
    isUsed: false,
    normalizedCode: row.code,
  };
}

export function activateLicenseAndCreateUserInSqlite(
  data: {
    code: string;
    name: string;
    email: string;
    phone: string;
    firmName: string;
    licenseNumber: string;
    city: string;
    password?: string;
  },
  db = getDb()
): {
  ok: boolean;
  error?: string;
  license?: AppLicense;
  user?: UserAccount;
  office?: OfficeProfile;
} {
  const verification = verifyPurchaseCodeInSqlite(data.code, db);
  if (!verification.ok || !verification.normalizedCode) {
    return { ok: false, error: verification.message };
  }

  const cleanCode = verification.normalizedCode;
  const nowIso = new Date().toISOString();
  const userId = `usr-${Date.now()}`;

  const userAccount: UserAccount = {
    id: userId,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    firmName: data.firmName.trim(),
    licenseNumber: data.licenseNumber.trim(),
    city: data.city.trim(),
    role: 'admin',
    createdAt: nowIso.slice(0, 10),
  };

  const appLicense: AppLicense = {
    isActivated: true,
    licenseCode: cleanCode,
    activatedAt: nowIso,
    licenseeName: userAccount.name,
    licenseeEmail: userAccount.email,
    firmName: userAccount.firmName,
    licenseNumber: userAccount.licenseNumber,
  };

  const officeProfile: OfficeProfile = {
    name: userAccount.firmName || 'مكتب المحاماة والاستشارات القانونية',
    title: `المحامي ${userAccount.name}`,
    licenseNumber: userAccount.licenseNumber
      ? `رخصة قيد محاماة رقم: ${userAccount.licenseNumber}`
      : 'مرخص من وزارة العدل',
    phone: userAccount.phone,
    email: userAccount.email,
    address: `${userAccount.city} - المقر الرئيسي للمكتب`,
    taxNumber: '',
    bankAccount: '',
    iban: '',
    bankName: '',
  };

  const leadLawyer: LawyerMember = {
    id: 'lawyer-lead',
    name: userAccount.name,
    role: 'المحامي العام والمدير المسؤول',
    email: userAccount.email,
    phone: userAccount.phone,
    avatarColor: 'bg-indigo-700',
  };

  db.exec('BEGIN IMMEDIATE TRANSACTION');
  try {
    // 1. Mark purchase code as used
    db.prepare(`
      UPDATE purchase_codes
      SET is_used = 1, used_at = ?, used_by_email = ?, used_by_name = ?, firm_name = ?
      WHERE code = ?
    `).run(nowIso, userAccount.email, userAccount.name, userAccount.firmName, cleanCode);

    // 2. Insert license
    db.prepare(`
      INSERT INTO app_license (id, is_activated, license_code, activated_at, licensee_name, licensee_email, firm_name, license_number, raw_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        is_activated = excluded.is_activated,
        license_code = excluded.license_code,
        activated_at = excluded.activated_at,
        licensee_name = excluded.licensee_name,
        licensee_email = excluded.licensee_email,
        firm_name = excluded.firm_name,
        license_number = excluded.license_number,
        raw_json = excluded.raw_json
    `).run(
      'current',
      1,
      cleanCode,
      nowIso,
      userAccount.name,
      userAccount.email,
      userAccount.firmName,
      userAccount.licenseNumber,
      JSON.stringify(appLicense)
    );

    // 3. Insert or update user
    db.prepare(`
      INSERT INTO users (id, name, email, phone, firm_name, license_number, city, password_hash, role, created_at, raw_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        email = excluded.email,
        phone = excluded.phone,
        firm_name = excluded.firm_name,
        license_number = excluded.license_number,
        city = excluded.city,
        password_hash = excluded.password_hash,
        raw_json = excluded.raw_json
    `).run(
      userAccount.id,
      userAccount.name,
      userAccount.email,
      userAccount.phone,
      userAccount.firmName,
      userAccount.licenseNumber,
      userAccount.city,
      data.password || '',
      userAccount.role,
      userAccount.createdAt,
      JSON.stringify(userAccount)
    );

    // 4. Save office profile and lead lawyer
    saveKeyValue('office_profile', officeProfile, db);
    saveKeyValue('current_user', userAccount, db);
    saveKeyValue('app_license', appLicense, db);
    db.prepare('DELETE FROM lawyers').run();
    db.prepare(`
      INSERT INTO lawyers (id, name, role, email, phone, avatar_color, raw_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      leadLawyer.id,
      leadLawyer.name,
      leadLawyer.role,
      leadLawyer.email,
      leadLawyer.phone,
      leadLawyer.avatarColor,
      JSON.stringify(leadLawyer)
    );

    // 5. Clean any residual demo records so app is pristine
    db.exec(`
      DELETE FROM clients;
      DELETE FROM cases;
      DELETE FROM sessions;
      DELETE FROM documents;
      DELETE FROM finance;
      DELETE FROM tasks;
    `);

    db.exec('COMMIT');
  } catch (err: any) {
    db.exec('ROLLBACK');
    return { ok: false, error: err?.message || 'خطأ في حفظ وتفعيل الرخصة' };
  }

  return {
    ok: true,
    license: appLicense,
    user: userAccount,
    office: officeProfile,
  };
}

export function getAppLicenseFromSqlite(db = getDb()): AppLicense {
  const row = db.prepare(`SELECT raw_json FROM app_license WHERE id = 'current'`).get() as { raw_json: string } | undefined;
  if (row) {
    try {
      return JSON.parse(row.raw_json);
    } catch {
      // fallback
    }
  }
  return getKeyValue<AppLicense>('app_license', { isActivated: false }, db);
}

export function getUserAccountFromSqlite(db = getDb()): UserAccount | null {
  const row = db.prepare(`SELECT raw_json FROM users ORDER BY created_at ASC LIMIT 1`).get() as { raw_json: string } | undefined;
  if (row) {
    try {
      return JSON.parse(row.raw_json);
    } catch {
      // fallback
    }
  }
  return getKeyValue<UserAccount | null>('current_user', null, db);
}

export function clearAllOperationalDataInSqlite(db = getDb()): void {
  db.exec(`
    DELETE FROM clients;
    DELETE FROM cases;
    DELETE FROM sessions;
    DELETE FROM documents;
    DELETE FROM finance;
    DELETE FROM tasks;
  `);
}

export function verifyUserCredentialsInSqlite(
  email: string,
  password?: string,
  db = getDb()
): { ok: boolean; user?: UserAccount; error?: string } {
  const normEmail = email.trim().toLowerCase();
  const row = db
    .prepare(`SELECT raw_json, password_hash FROM users WHERE LOWER(email) = ?`)
    .get(normEmail) as { raw_json: string; password_hash: string | null } | undefined;

  if (!row) {
    return { ok: false, error: 'البريد الإلكتروني غير مسجل في النظام' };
  }

  if (password && row.password_hash && row.password_hash !== password) {
    return { ok: false, error: 'كلمة المرور غير صحيحة، يرجى المحاولة مجدداً' };
  }

  try {
    const user = JSON.parse(row.raw_json) as UserAccount;
    return { ok: true, user };
  } catch {
    return { ok: false, error: 'تعذر قراءة بيانات حساب المستخدم' };
  }
}

export function resetLicenseInSqlite(db = getDb()): void {
  db.exec('BEGIN IMMEDIATE TRANSACTION');
  try {
    db.exec(`DELETE FROM app_license; DELETE FROM users;`);
    db.prepare(`UPDATE purchase_codes SET is_used = 0, used_at = NULL, used_by_email = NULL, used_by_name = NULL, firm_name = NULL`).run();
    db.exec(`DELETE FROM kv_store WHERE key IN ('app_license', 'current_user');`);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
