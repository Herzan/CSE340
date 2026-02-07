require('dotenv').config()
const bcrypt = require('bcryptjs')
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function testLogin(email, password) {
  const result = await pool.query(
    'SELECT account_password FROM account WHERE account_email = $1',
    [email]
  )

  if (result.rows.length === 0) {
    console.log('❌ User not found')
    return
  }

  const match = await bcrypt.compare(
    password,
    result.rows[0].account_password
  )

  console.log(match ? '✅ LOGIN SUCCESS' : '❌ INVALID PASSWORD')
  await pool.end()
}

// TRY PASSWORDS
testLogin('admin@cse340.com', 'Admin123!')

