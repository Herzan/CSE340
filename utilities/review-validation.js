const utilities = require('./')
const { body, validationResult } = require('express-validator')
const reviewModel = require('../models/review-model')
const invModel = require('../models/inventory-model')
const validate = {}

/*  **********************************
 *  Inventory Data Validation Rules
 * ********************************* */
validate.reviewRules = () => {
    return [
        // comment is required
        body('review_text').trim().escape().notEmpty().withMessage('Review Comment must not be empty.'),
    ]
}

/* ******************************
 * Check data and return errors or continue to next
 * ***************************** */
validate.checkAddReviewData = async (req, res, next) => {
    const { inv_id, account_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        const invID = parseInt(inv_id)
        const accountID = parseInt(account_id)
        const data = await invModel.getInventoryById(invID)
        const reviewData = await reviewModel.getReviewsById(invID)
        const customerReviews = await utilities.buildReviews(reviewData)
        const grid = await utilities.buildDetailsGrid(data)
        let nav = await utilities.getNav()
        const className = `${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}`
        res.render('inventory/details', {
            errors,
            title: className,
            nav,
            grid,
            customerReviews,
            invID,
            accountID,
        })
        return
    }
    next()
}

/* ******************************
 * Check data and return errors or continue to next
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const review_id = parseInt(req.params.reviewId)
        const reviewData = await reviewModel.getReviewsByReviewID(review_id)
        const review = reviewData[0]
        const itemName = `${review.inv_year} ${review.inv_make} ${review.inv_model}`
        res.render('review/edit-review', {
            errors,
            title: `Edit ${itemName} Review`,
            nav,
            review,
            review_date: review.review_date.toLocaleDateString('en-US', options),
            review_text: review.review_text,
            review_id: review.review_id,
        })
        return
    }
    next()
}

module.exports = validate

