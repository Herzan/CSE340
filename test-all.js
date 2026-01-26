const pool = require('./database/')
require('dotenv').config()

async function testEverything() {
  console.log('🧪 Testing entire system...\n')
  
  try {
    // 1. Test database connection
    console.log('1. Testing database connection...')
    const connection = await pool.query('SELECT NOW()')
    console.log('   ✅ Database connected:', connection.rows[0].now)
    
    // 2. Test classifications
    console.log('\n2. Testing classifications...')
    const classifications = await pool.query('SELECT * FROM classification ORDER BY classification_id')
    console.log(`   ✅ Found ${classifications.rows.length} classifications:`)
    classifications.rows.forEach(row => {
      console.log(`      - ${row.classification_id}: ${row.classification_name}`)
    })
    
    // 3. Test Custom classification (should be ID 1)
    console.log('\n3. Testing Custom classification (should be ID 1)...')
    const custom = await pool.query("SELECT * FROM classification WHERE classification_name = 'Custom'")
    if (custom.rows.length > 0) {
      console.log(`   ✅ Custom classification found: ID ${custom.rows[0].classification_id}`)
    } else {
      console.log('   ❌ Custom classification NOT FOUND!')
    }
    
    // 4. Test Custom vehicles
    console.log('\n4. Testing Custom vehicles...')
    const customVehicles = await pool.query(`
      SELECT i.*, c.classification_name 
      FROM inventory i 
      JOIN classification c ON i.classification_id = c.classification_id 
      WHERE c.classification_name = 'Custom'
    `)
    console.log(`   ✅ Found ${customVehicles.rows.length} Custom vehicles:`)
    
    if (customVehicles.rows.length === 0) {
      console.log('   ⚠️  NO CUSTOM VEHICLES FOUND! This is why you get 404.')
      console.log('   Solution: Run the SQL setup script on your Render database.')
    } else {
      customVehicles.rows.forEach((vehicle, index) => {
        console.log(`      ${index + 1}. ${vehicle.inv_make} ${vehicle.inv_model} (${vehicle.inv_year})`)
      })
    }
    
    // 5. Test account table
    console.log('\n5. Testing account table...')
    const accounts = await pool.query('SELECT * FROM account')
    console.log(`   ✅ Found ${accounts.rows.length} accounts`)
    
    // 6. Test the exact query your model uses
    console.log('\n6. Testing the exact model query for classification_id=1...')
    const modelQueryResult = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [1]
    )
    console.log(`   ✅ Model query returned: ${modelQueryResult.rows.length} vehicles`)
    
    // 7. Test URL structure
    console.log('\n7. Testing URL structure...')
    console.log('   Your navigation should link to: /inv/type/1')
    console.log('   Direct URL to test: http://localhost:5501/inv/type/1')
    
    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('SUMMARY:')
    console.log('='.repeat(50))
    
    if (customVehicles.rows.length > 0) {
      console.log('✅ Database has Custom vehicles')
      console.log('✅ Database connection works')
      console.log('✅ Classifications exist')
      console.log('\n⚠️  If you still get 404, check:')
      console.log('   1. Your invController.js has const nav = await utilities.getNav()')
      console.log('   2. Your server is running on port 5501')
      console.log('   3. Try visiting: http://localhost:5501/inv/type/1')
    } else {
      console.log('❌ PROBLEM: No Custom vehicles in database!')
      console.log('\nSOLUTION:')
      console.log('1. Connect to your Render database')
      console.log('2. Run the SQL setup script above')
      console.log('3. Restart your server: pnpm run dev')
      console.log('4. Visit: http://localhost:5501/inv/type/1')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\nTROUBLESHOOTING:')
    console.log('1. Check DATABASE_URL in .env file')
    console.log('2. Check password is correct')
    console.log('3. Check if database "demohh" exists on Render')
  }
}

testEverything()