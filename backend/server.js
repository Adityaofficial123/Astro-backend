'use strict';

require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const app = express();

app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false
});
app.use('/api', apiLimiter);

const port = Number(process.env.PORT || 3000);

const frontendDirCandidate = path.join(__dirname, '..', 'frontend');
const frontendDirFallback = path.join(__dirname, '..');
const frontendDir = fs.existsSync(frontendDirCandidate) ? frontendDirCandidate : frontendDirFallback;

app.use(express.static(frontendDir, { index: false }));

function sendIndex(res) {
  res.sendFile(path.join(frontendDir, 'index.html'));
}

app.get('/', (req, res) => sendIndex(res));

app.get(['/index.html', '/about.html', '/contact.html', '/gallery.html', '/members.html', '/programs.html', '/admin.html'], (req, res) => {
  const rel = String(req.path || '').replace(/^\/+/, '');
  res.sendFile(path.join(frontendDir, rel));
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 7 * 1024 * 1024 }
});

function uploadBufferToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });

    stream.end(buffer);
  });
}

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file_missing' });

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: 'cloudinary_not_configured' });
    }

    const folder = String(process.env.CLOUDINARY_FOLDER || 'astroweb');

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder,
      resource_type: 'image'
    });

    return res.json({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (e) {
    return res.status(500).json({
      error: 'upload_failed',
      message: e && e.message ? e.message : 'unknown_error'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use((req, res) => {
  if (req.method !== 'GET') return res.status(404).json({ error: 'not_found' });
  return sendIndex(res);
});

app.listen(port, () => {
  console.log(`[backend] listening on http://localhost:${port}`);
  console.log(`[backend] serving frontend from: ${frontendDir}`);
});
