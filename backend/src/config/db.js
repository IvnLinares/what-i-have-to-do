const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL Connection Pool for Supabase
const pool = new Pool({
  host: process.env.DB_HOST || 'db.pemudfoinavlslhkgjlk.supabase.co',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

// Connection event handlers
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL (Supabase)');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Wrapper object to provide a consistent API similar to the SQLite version
 * This allows models to work with both SQLite and PostgreSQL
 */
const db = {
  /**
   * Run a query (INSERT, UPDATE, DELETE)
   * Returns: { rows: [], rowCount, command }
   */
  async run(text, params = []) {
    try {
      const result = await pool.query(text, params);
      return {
        changes: result.rowCount,
        lastID: result.rows[0]?.id,
        ...result
      };
    } catch (error) {
      console.error('Query error:', error.message);
      throw error;
    }
  },

  /**
   * Get a single row
   * Returns: first row or undefined
   */
  async get(text, params = []) {
    try {
      const result = await pool.query(text, params);
      return result.rows[0];
    } catch (error) {
      console.error('Query error:', error.message);
      throw error;
    }
  },

  /**
   * Get all matching rows
   * Returns: array of rows
   */
  async all(text, params = []) {
    try {
      const result = await pool.query(text, params);
      return result.rows;
    } catch (error) {
      console.error('Query error:', error.message);
      throw error;
    }
  },

  /**
   * Close the connection pool
   */
  async close() {
    try {
      await pool.end();
      console.log('Database connection pool closed');
    } catch (error) {
      console.error('Error closing connection pool:', error);
    }
  }
};

module.exports = db;
