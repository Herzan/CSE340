// test-db-simple.js
require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function test() {
  console.log('=== DATABASE TEST ===\n')

  try {
    const client = await pool.connect()
    console.log('✅ Connected to database\n')

    // Get all usernames + passwords
    const result = await client.query(`
      SELECT 
        account_id,
        account_email AS username,
        account_password AS password,
        account_type
      FROM account
    `)

    console.log(`Found ${result.rows.length} account(s)\n`)

    result.rows.forEach((account, index) => {
      console.log(`Account #${index + 1}`)
      console.log(`ID: ${account.account_id}`)
      console.log(`Username (email): ${account.username}`)
      console.log(`Password hash: ${account.password}`)
      console.log(`Password length: ${account.password.length}`)
      console.log(`Type: ${account.account_type}`)
      console.log('---------------------------')
    })

    client.release()
  } catch (error) {
    console.error('❌ ERROR:', error.message)
  }

  console.log('\n=== END TEST ===')
  await pool.end()
}

test()
