require('dotenv').config()
const bcrypt = require('bcryptjs')
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function resetPassword() {
  const newHash = await bcrypt.hash('Adm1n$2025al', 10)

  await pool.query(
    `UPDATE account
     SET account_password = $1
     WHERE account_email = 'admin@cse340.com'`,
    [newHash]
  )

  console.log('✅ Admin password reset to: Adm1n$2025al')
  await pool.end()
}

resetPassword()
