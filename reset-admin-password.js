require('dotenv').config()
const bcrypt = require('bcryptjs')
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function resetPassword() {
  const newHash = await bcrypt.hash('Admin123!', 10)

  await pool.query(
    `UPDATE account
     SET account_password = $1
     WHERE account_email = 'admin@cse340.com'`,
    [newHash]
  )

  console.log('✅ Admin password reset to: Admin123!')
  await pool.end()
}

resetPassword()
