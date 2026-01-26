const pool = require('../database/')

/* ***************************
 *  Get all Reviews by inventory_id and account_id
 * ************************** */
async function getReviewsById(inv_id, account_id) {
    try {
        // Convert undefined to NULL for SQL
        const accountId = account_id === undefined ? null : account_id
        const sql = `SELECT * 
            FROM public.review AS i
            JOIN public.inventory AS c 
            ON i.inv_id = c.inv_id
            LEFT JOIN public.account AS x
            ON i.account_id = x.account_id
            WHERE i.inv_id = $1 AND (i.account_id = $2 OR $2 IS NULL)`
        const data = await pool.query(sql, [inv_id, accountId])
        return data.rows
    } catch (error) {
        console.error('getReviewsById error ' + error)
    }
}

/* ***************************
 *  Get all Reviews by account_id
 * ************************** */
async function getReviewsByIdOnly(account_id) {
    try {
        const sql = `SELECT * 
            FROM public.review AS i
            JOIN public.inventory AS c 
            ON i.inv_id = c.inv_id
            LEFT JOIN public.account AS x
            ON i.account_id = x.account_id
            WHERE i.account_id = $1`
        const data = await pool.query(sql, [account_id])
        return data.rows
    } catch (error) {
        console.error('getReviewsById error ' + error)
    }
}

/* ***************************
 *  Get all Reviews by review_id
 * ************************** */
async function getReviewsByReviewID(review_id) {
    try {
        const sql = `SELECT * 
            FROM public.review AS i
            JOIN public.inventory AS c 
            ON i.inv_id = c.inv_id
            WHERE i.review_id = $1`
        const data = await pool.query(sql, [review_id])
        return data.rows
    } catch (error) {
        console.error('getReviewsById error ' + error)
    }
}

/* ***************************
 *  Add a new Review to the database
 * ************************** */
async function addCustomerReview(inv_id, account_id, review_text) {
    try {
        const sql = 'INSERT INTO review (inv_id, account_id, review_text) VALUES ($1, $2, $3) RETURNING *'
        return await pool.query(sql, [inv_id, account_id, review_text])
    } catch (error) {
        console.error('Database Error:', error.message)
        return error.message
    }
}

/* ***************************
 *  Edit/Update Reviews to the database
 * ************************** */
async function updateReviews(review_text, review_id) {
    try {
        const sql = 'UPDATE review SET review_text = $1 WHERE review_id = $2 RETURNING *'
        const data = await pool.query(sql, [review_text, review_id])
        return data.rows[0]
    } catch (error) {
        console.error('model error: ' + error)
    }
}

/* ***************************
 *  Delete Review to the database
 * ************************** */
async function deleteReview(review_id) {
    try {
        const sql = 'DELETE FROM review WHERE review_id = $1'
        const data = await pool.query(sql, [review_id])
        return data
    } catch (error) {
        new Error('Delete Inventory Error')
    }
}

module.exports = {
    getReviewsById,
    addCustomerReview,
    getReviewsByIdOnly,
    getReviewsByReviewID,
    updateReviews,
    deleteReview
}
