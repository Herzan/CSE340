const { Pool } = require("pg")
require("dotenv").config()

/* ***************
 * Connection Pool for Render PostgreSQL
 * Always use SSL for cloud databases
 * *************** */

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL is not set in .env file")
  process.exit(1)
}

console.log("🔗 Connecting to Render PostgreSQL database...")

// For Render databases, ALWAYS use SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,  // Required for Render
  },
})

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ Connected to Render PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('❌ Database error:', err.message)
})

// Export query method
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      return res
    } catch (error) {
      console.error('❌ Query error:', error.message)
      console.error('Query was:', text.substring(0, 200))
      throw error
    }
  },
  
  // Also export pool for transactions if needed
  getPool: () => pool
}