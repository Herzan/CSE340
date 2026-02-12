const pool = require('../database/');

/* ****************************************
 *  Register new account (client by default)
 **************************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql =
      `INSERT INTO account 
         (account_firstname, account_lastname, account_email, account_password, account_type) 
       VALUES ($1, $2, $3, $4, 'Client')
       RETURNING *`;
    const data = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
    return data.rows[0];
  } catch (error) {
    console.error('Error registering account:', error);
    throw new Error('Failed to register account');
  }
}

/* ****************************************
 *  Check if email already exists
 *  Returns the account row if found, or null if not
 **************************************** */
async function checkExistingEmail(account_email) {
  try {
    const sql = `
      SELECT account_id, account_email 
      FROM account 
      WHERE account_email = $1
    `;
    const result = await pool.query(sql, [account_email]);
    
    return result.rowCount > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error checking existing email:', error);
    throw new Error('Failed to check email existence');
  }
}

/* ****************************************
 *  Get account by email
 **************************************** */
async function getAccountByEmail(account_email) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, 
             account_email, account_type, account_password 
      FROM account 
      WHERE account_email = $1
    `;
    const result = await pool.query(sql, [account_email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching account by email:', error);
    throw new Error('No matching email found');
  }
}

/* ****************************************
 *  Get account by ID
 **************************************** */
async function getAccountById(account_id) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, 
             account_email, account_type, account_password 
      FROM account 
      WHERE account_id = $1
    `;
    const result = await pool.query(sql, [account_id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching account by ID:', error);
    throw new Error('No matching account ID found');
  }
}

/* ****************************************
 *  Update account basic information
 *  (includes email uniqueness check inside controller — this function just does the update)
 **************************************** */
async function updateAccountInfo(account_firstname, account_lastname, account_email, account_id) {
  try {
    const sql = `
      UPDATE account
      SET account_firstname = $1,
          account_lastname  = $2,
          account_email     = $3
      WHERE account_id = $4
      RETURNING account_id, account_firstname, account_lastname, account_email, account_type
    `;
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
    
    if (result.rowCount === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating account info:', error);
    throw new Error('Failed to update account information');
  }
}

/* ****************************************
 *  Update account password only
 **************************************** */
async function updatePassword(account_password, account_id) {
  try {
    const sql = `
      UPDATE account
      SET account_password = $1
      WHERE account_id = $2
      RETURNING account_id, account_firstname, account_lastname, account_email, account_type
    `;
    const result = await pool.query(sql, [account_password, account_id]);
    
    if (result.rowCount === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating password:', error);
    throw new Error('Failed to update password');
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,     // Now returns the row (or null) — perfect for update check
  getAccountByEmail,
  getAccountById,
  updateAccountInfo,
  updatePassword,
};