import express from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import {
  getAllBootstrapData,
  getSqliteStats,
  saveClientsToSqlite,
  saveCasesToSqlite,
  saveSessionsToSqlite,
  saveDocumentsToSqlite,
  saveDocumentBinaryDirectly,
  upsertDocumentWithBinaryInSqlite,
  getDocumentWithBinaryFromSqlite,
  deleteDocumentFromSqlite,
  saveFinanceToSqlite,
  saveTasksToSqlite,
  saveLawyersToSqlite,
  saveCourtsToSqlite,
  saveKeyValue,
  executeReadQuery,
  exportSqliteFileBuffer,
  importSqliteFileBuffer,
  resetSqliteDatabase,
  verifyPurchaseCodeInSqlite,
  activateLicenseAndCreateUserInSqlite,
  getAppLicenseFromSqlite,
  getUserAccountFromSqlite,
  getPurchaseCodesFromSqlite,
  verifyUserCredentialsInSqlite,
  resetLicenseInSqlite
} from './src/db/sqlite.ts';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 40 * 1024 * 1024 }, // 40MB max file size
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON bodies and binary SQLite file uploads up to 25MB
  app.use(express.json({ limit: '25mb' }));
  app.use('/api/sqlite/upload', express.raw({ type: 'application/octet-stream', limit: '25mb' }));

  // 1. Bootstrap all collections + SQLite engine stats
  app.get('/api/bootstrap', (_req, res) => {
    try {
      const data = getAllBootstrapData();
      res.json({ ok: true, data });
    } catch (err: any) {
      console.error('SQLite bootstrap error:', err);
      res.status(500).json({ ok: false, error: err?.message || 'Database error' });
    }
  });

  // 2. Get live SQLite stats
  app.get('/api/sqlite/stats', (_req, res) => {
    try {
      const stats = getSqliteStats();
      res.json({ ok: true, stats });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message });
    }
  });

  // 3. Sync any collection to SQLite tables
  app.put('/api/sync/:collection', (req, res) => {
    try {
      const { collection } = req.params;
      const payload = req.body?.data;

      switch (collection) {
        case 'clients':
          saveClientsToSqlite(payload || []);
          break;
        case 'cases':
          saveCasesToSqlite(payload || []);
          break;
        case 'sessions':
          saveSessionsToSqlite(payload || []);
          break;
        case 'documents':
          saveDocumentsToSqlite(payload || []);
          break;
        case 'finance':
          saveFinanceToSqlite(payload || []);
          break;
        case 'tasks':
          saveTasksToSqlite(payload || []);
          break;
        case 'lawyers':
          saveLawyersToSqlite(payload || []);
          break;
        case 'courts':
          saveCourtsToSqlite(payload || []);
          break;
        case 'office':
          saveKeyValue('office_profile', payload);
          break;
        case 'settings':
          saveKeyValue('app_settings', payload);
          break;
        default:
          res.status(400).json({ ok: false, error: `Unknown collection: ${collection}` });
          return;
      }

      res.json({ ok: true, stats: getSqliteStats() });
    } catch (err: any) {
      console.error(`Error syncing ${req.params.collection}:`, err);
      res.status(500).json({ ok: false, error: err?.message });
    }
  });

  // 4. Execute safe SELECT / PRAGMA SQL query
  app.post('/api/sqlite/query', (req, res) => {
    try {
      const { sql } = req.body;
      if (!sql || typeof sql !== 'string') {
        res.status(400).json({ ok: false, error: 'يرجى كتابة استعلام SQL صالح' });
        return;
      }
      const rows = executeReadQuery(sql);
      res.json({ ok: true, rows, count: rows.length });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err?.message || 'خطأ في تنفيذ استعلام SQL' });
    }
  });

  // 5. Download raw .sqlite binary database file
  app.get('/api/sqlite/download', (_req, res) => {
    try {
      const buffer = exportSqliteFileBuffer();
      const dateStr = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'application/x-sqlite3');
      res.setHeader('Content-Disposition', `attachment; filename="SeaStar_Database_${dateStr}.sqlite"`);
      res.send(buffer);
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message });
    }
  });

  // 6. Upload & restore raw .sqlite binary file
  app.post('/api/sqlite/upload', (req, res) => {
    try {
      const buffer = req.body as Buffer;
      if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 100) {
        res.status(400).json({ ok: false, error: 'ملف قاعدة بيانات فارغ أو غير صالح' });
        return;
      }
      const success = importSqliteFileBuffer(buffer);
      if (!success) {
        res.status(400).json({ ok: false, error: 'الملف المرفوع ليس ملف قاعدة بيانات SQLite 3 صالح' });
        return;
      }
      const data = getAllBootstrapData();
      res.json({ ok: true, data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message });
    }
  });

  // 7. Import JSON backup into SQLite tables
  app.post('/api/sqlite/import-json', (req, res) => {
    try {
      const data = req.body;
      if (!data || typeof data !== 'object') {
        res.status(400).json({ ok: false, error: 'بيانات JSON غير صالحة' });
        return;
      }
      if (Array.isArray(data.clients)) saveClientsToSqlite(data.clients);
      if (Array.isArray(data.cases)) saveCasesToSqlite(data.cases);
      if (Array.isArray(data.sessions)) saveSessionsToSqlite(data.sessions);
      if (Array.isArray(data.documents)) saveDocumentsToSqlite(data.documents);
      if (Array.isArray(data.finance)) saveFinanceToSqlite(data.finance);
      if (Array.isArray(data.tasks)) saveTasksToSqlite(data.tasks);
      if (Array.isArray(data.lawyers)) saveLawyersToSqlite(data.lawyers);
      if (data.office) saveKeyValue('office_profile', data.office);
      if (data.settings) saveKeyValue('app_settings', data.settings);

      res.json({ ok: true, data: getAllBootstrapData() });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message });
    }
  });

  // 8. Reset SQLite database ('demo' or 'empty')
  app.post('/api/sqlite/reset', (req, res) => {
    try {
      const mode = req.body?.mode === 'empty' ? 'empty' : 'demo';
      resetSqliteDatabase(mode);
      res.json({ ok: true, data: getAllBootstrapData() });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message });
    }
  });

  // 9. Upload & persist single document with binary BLOB into SQLite
  app.post('/api/documents/upload', upload.single('file'), (req, res) => {
    try {
      let docData: any = {};
      let fileBuffer: Buffer | undefined;
      let originalFileName: string | undefined;
      let detectedMimeType: string | undefined;

      if (req.file) {
        fileBuffer = req.file.buffer;
        originalFileName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
        detectedMimeType = req.file.mimetype;
        docData = {
          id: req.body.id,
          title: req.body.title || originalFileName.replace(/\.[^/.]+$/, ''),
          type: req.body.type || 'أخرى',
          caseId: req.body.caseId,
          caseNumber: req.body.caseNumber,
          clientId: req.body.clientId,
          clientName: req.body.clientName,
          confidentiality: req.body.confidentiality || 'عام / سكرتارية',
          notes: req.body.notes || '',
          tags: req.body.tags
            ? (typeof req.body.tags === 'string'
                ? req.body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                : req.body.tags)
            : [],
        };
      } else if (req.body?.document) {
        docData = req.body.document;
      } else {
        docData = req.body || {};
      }

      if (!docData.title && !originalFileName) {
        res.status(400).json({ ok: false, error: 'يرجى تحديد عنوان المستند أو اختيار ملف صالح' });
        return;
      }

      const saved = saveDocumentBinaryDirectly(
        docData,
        fileBuffer,
        originalFileName,
        detectedMimeType
      );

      res.json({ ok: true, document: saved, stats: getSqliteStats() });
    } catch (err: any) {
      console.error('Error uploading document to SQLite:', err);
      res.status(500).json({ ok: false, error: err?.message || 'فشل حفظ وأرشفة المستند في قاعدة بيانات SQLite' });
    }
  });

  // 10. Fetch single document metadata + dataUri from SQLite
  app.get('/api/documents/:id', (req, res) => {
    try {
      const found = getDocumentWithBinaryFromSqlite(req.params.id);
      if (!found) {
        res.status(404).json({ ok: false, error: 'المستند غير موجود في قاعدة بيانات SQLite' });
        return;
      }
      res.json({ ok: true, document: found.document });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message });
    }
  });

  // 11. Download raw binary document from SQLite BLOB
  app.get('/api/documents/:id/download', (req, res) => {
    try {
      const found = getDocumentWithBinaryFromSqlite(req.params.id);
      if (!found) {
        res.status(404).send('Document not found in SQLite');
        return;
      }
      const encodedName = encodeURIComponent(found.fileName);
      res.setHeader('Content-Type', found.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="document"; filename*=UTF-8''${encodedName}`
      );
      res.setHeader('Content-Length', String(found.buffer.length));
      res.send(found.buffer);
    } catch (err: any) {
      res.status(500).send(err?.message || 'Download error');
    }
  });

  // 12. Stream inline binary document from SQLite BLOB for embedded preview
  app.get('/api/documents/:id/inline', (req, res) => {
    try {
      const found = getDocumentWithBinaryFromSqlite(req.params.id);
      if (!found) {
        res.status(404).send('Document not found in SQLite');
        return;
      }
      const encodedName = encodeURIComponent(found.fileName);
      res.setHeader('Content-Type', found.mimeType);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="document"; filename*=UTF-8''${encodedName}`
      );
      res.send(found.buffer);
    } catch (err: any) {
      res.status(500).send(err?.message || 'Preview error');
    }
  });

  // 13. Delete document and its BLOB from SQLite
  app.delete('/api/documents/:id', (req, res) => {
    try {
      deleteDocumentFromSqlite(req.params.id);
      res.json({ ok: true, stats: getSqliteStats() });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message });
    }
  });

  // 14. License & Purchase Code API
  app.post('/api/license/verify', (req, res) => {
    try {
      const { code } = req.body || {};
      const result = verifyPurchaseCodeInSqlite(code);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ ok: false, message: err?.message || 'خطأ في التحقق من كود الشراء' });
    }
  });

  app.post('/api/license/activate', (req, res) => {
    try {
      const result = activateLicenseAndCreateUserInSqlite(req.body || {});
      if (!result.ok) {
        res.status(400).json(result);
        return;
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message || 'خطأ في تفعيل النسخة' });
    }
  });

  app.get('/api/license/status', (_req, res) => {
    try {
      const license = getAppLicenseFromSqlite();
      const user = getUserAccountFromSqlite();
      res.json({ ok: true, license, user });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message });
    }
  });

  app.post('/api/license/reset', (_req, res) => {
    try {
      resetLicenseInSqlite();
      res.json({ ok: true, message: 'تم إعادة تهيئة التراخيص بنجاح' });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message });
    }
  });

  // 15. User Authentication / Login
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email) {
        res.status(400).json({ ok: false, error: 'يرجى إدخال البريد الإلكتروني' });
        return;
      }
      const result = verifyUserCredentialsInSqlite(email, password);
      if (!result.ok) {
        res.status(401).json(result);
        return;
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SeaStar SQLite Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
