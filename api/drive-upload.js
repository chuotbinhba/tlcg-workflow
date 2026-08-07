// Vercel Serverless Function — POST /api/drive-upload
//
// Accepts multipart/form-data with:
//   parentFolderId  — Drive folder ID (from env, passed by client)
//   subfolderName   — subfolder to create/reuse inside parentFolderId
//   file            — (optional) binary file to upload
//
// Authenticates server-side via Service Account (no user OAuth popup).
// Returns JSON: { subFolderId, subFolderLink, fileId?, fileName?, webViewLink? }

import Busboy from 'busboy';
import { google } from 'googleapis';
import { Readable } from 'stream';

export const config = { api: { bodyParser: false } };

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    const fields = {};
    let fileBuffer = null, fileName = null, fileMime = null;

    busboy.on('field', (name, val) => { fields[name] = val; });
    busboy.on('file', (_name, stream, info) => {
      fileName = info.filename;
      fileMime = info.mimeType;
      const chunks = [];
      stream.on('data', d => chunks.push(d));
      stream.on('end', () => { fileBuffer = Buffer.concat(chunks); });
    });
    busboy.on('finish', () => resolve({ fields, fileBuffer, fileName, fileMime }));
    busboy.on('error', reject);
    req.pipe(busboy);
  });
}

/**
 * Repair a PEM private key that lost its line breaks.
 *
 * systemd's EnvironmentFile interprets backslash escapes, so the `\n`
 * sequences inside GOOGLE_SERVICE_ACCOUNT_KEY are consumed before the process
 * ever sees them and the PEM arrives as a single line. Node's crypto then
 * fails with "DECODER routines::unsupported". Vercel passed the value through
 * untouched, so this only shows up on a self-hosted/systemd deployment.
 *
 * Re-wrap the base64 body at 64 characters when the header and body have been
 * flattened onto one line. A key that still has real newlines is returned
 * unchanged.
 */
function normalizePrivateKey(pk) {
  if (typeof pk !== 'string' || pk.includes('\n')) return pk;

  const m = pk.match(/^(-----BEGIN [^-]+-----)\s*(.*?)\s*(-----END [^-]+-----)\s*$/);
  if (!m) return pk;

  const [, header, body, footer] = m;
  const wrapped = body.replace(/\s+/g, '').match(/.{1,64}/g) || [];
  return `${header}\n${wrapped.join('\n')}\n${footer}\n`;
}

function getDriveClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set');

  const key = JSON.parse(raw);
  if (key.private_key) key.private_key = normalizePrivateKey(key.private_key);

  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
}

async function getOrCreateSubfolder(drive, parentFolderId, subfolderName) {
  const safe = subfolderName.replace(/'/g, "\\'");
  const q = `name='${safe}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const list = await drive.files.list({ q, fields: 'files(id)', pageSize: 1, supportsAllDrives: true, includeItemsFromAllDrives: true });
  if (list.data.files && list.data.files.length > 0) {
    return list.data.files[0].id;
  }
  const created = await drive.files.create({
    requestBody: {
      name: subfolderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    fields: 'id',
    supportsAllDrives: true,
  });
  return created.data.id;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { fields, fileBuffer, fileName, fileMime } = await parseMultipart(req);
    const { parentFolderId, subfolderName } = fields;

    if (!parentFolderId || !subfolderName) {
      return res.status(400).json({ error: 'parentFolderId and subfolderName are required' });
    }
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return res.status(500).json({ error: 'Service account not configured' });
    }

    const drive = getDriveClient();
    const subFolderId = await getOrCreateSubfolder(drive, parentFolderId, subfolderName);
    const subFolderLink = `https://drive.google.com/drive/folders/${subFolderId}`;

    // Folder-only creation (no file attached)
    if (!fileBuffer) {
      return res.status(200).json({ subFolderId, subFolderLink });
    }

    // Upload file into subfolder
    const uploaded = await drive.files.create({
      requestBody: { name: fileName, parents: [subFolderId] },
      media: {
        mimeType: fileMime || 'application/octet-stream',
        body: Readable.from(fileBuffer),
      },
      fields: 'id,name,webViewLink',
      supportsAllDrives: true,
    });

    // Set public reader permission so webViewLink works for anyone
    await drive.permissions.create({
      fileId: uploaded.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    });

    return res.status(200).json({
      subFolderId,
      subFolderLink,
      fileId: uploaded.data.id,
      fileName: uploaded.data.name,
      webViewLink: uploaded.data.webViewLink ||
        `https://drive.google.com/file/d/${uploaded.data.id}/view`,
    });
  } catch (err) {
    console.error('[drive-upload]', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
