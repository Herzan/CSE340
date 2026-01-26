const invModel = require('../models/inventory-model')
const reviewModel = require('../models/review-model')
const utilities = require('../utilities/')

const revCont = {}

/* ***************************
 *  Add Customer Review
 * ************************** */
revCont.addCustomerReview = async function (req, res, next) {
    const { inv_id, account_id, review_text } = req.body

    const regResult = await reviewModel.addCustomerReview(inv_id, account_id, review_text)
    const data = await invModel.getInventoryById(inv_id)
    const reviewData = await reviewModel.getReviewsById(inv_id)
    const customerReviews = await utilities.buildReviews(reviewData)
    const grid = await utilities.buildDetailsGrid(data)
    let nav = await utilities.getNav()
    const className = `${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}`

    if (regResult) {
        req.flash('success', `Success, your review has been added.`)
        res.render('inventory/details', {
            title: className,
            nav,
            grid,
            customerReviews,
            inv_id,
            account_id,
            errors: null,
        })
    } else {
        req.flash('notice', 'Sorry, adding inventory failed.')
        res.render('inventory/details', {
            title: className,
            nav,
            grid,
            customerReviews,
            inv_id,
            account_id,
            errors: null,
        })
    }
}

/* ***********************
 * Deliver Update Review View
 *************************/
revCont.updateReviewView = async function (req, res) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }
    let nav = await utilities.getNav()
    const account_id = res.locals.accountData?.account_id ? parseInt(res.locals.accountData.account_id) : null
    const myReviewData = await reviewModel.getReviewsByIdOnly(account_id)
    const myReviews = await utilities.buildMyReviews(myReviewData)
    const review_id = parseInt(req.params.reviewId)
    const reviewData = await reviewModel.getReviewsByReviewID(review_id)
    const review = reviewData[0]
    const itemName = `${review.inv_year} ${review.inv_make} ${review.inv_model}`

    if (!reviewData || reviewData.length === 0) {
        req.flash('notice', 'Sorry, review not found.')
        res.render('account/management', {
            title: 'Account Management',
            nav,
            myReviews,
            errors: null,
        })
    } else {
        res.render('review/edit-review', {
            title: `Edit ${itemName} Review`,
            nav,
            review,
            review_date: review.review_date.toLocaleDateString('en-US', options),
            review_text: review.review_text,
            review_id: review.review_id,
            errors: null,
        })
    }
}

/* ***************************
 *  Update Review Data
 * ************************** */
revCont.updateReview = async function (req, res, next) {
    let nav = await utilities.getNav()
    const { review_text, review_id } = req.body
    const reviewID = parseInt(review_id)
    const updateResult = await reviewModel.updateReviews(review_text, reviewID)
    const invData = await invModel.getInventoryById(updateResult.inv_id)
    const itemName = `${invData[0].inv_year} ${invData[0].inv_make} ${invData[0].inv_model}`
    if (updateResult) {
        req.flash('success', `The ${itemName} was successfully updated.`)
        res.redirect('/account/')
    } else {
        req.flash('notice', 'Sorry, the review update failed.')
        res.render('review/edit-review', {
            title: `Edit ${itemName} Review`,
            nav,
            review,
            review_date: review.review_date.toLocaleDateString('en-US', options),
            review_text: review.review_text,
            errors: null,
        })
    }
}

/* ***********************
 * Deliver Delete Review View
 *************************/
revCont.deleteReviewView = async function (req, res) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }
    let nav = await utilities.getNav()
    const account_id = res.locals.accountData?.account_id ? parseInt(res.locals.accountData.account_id) : null
    const myReviewData = await reviewModel.getReviewsByIdOnly(account_id)
    const myReviews = await utilities.buildMyReviews(myReviewData)
    const review_id = parseInt(req.params.reviewId)
    const reviewData = await reviewModel.getReviewsByReviewID(review_id)
    const review = reviewData[0]
    const itemName = `${review.inv_year} ${review.inv_make} ${review.inv_model}`

    if (!reviewData || reviewData.length === 0) {
        req.flash('notice', 'Sorry, review not found.')
        res.render('account/management', {
            title: 'Account Management',
            nav,
            myReviews,
            errors: null,
        })
    } else {
        res.render('review/delete-review', {
            title: `Delete ${itemName} Review`,
            nav,
            review,
            review_date: review.review_date.toLocaleDateString('en-US', options),
            review_text: review.review_text,
            review_id: review.review_id,
            errors: null,
        })
    }
}

/* ***************************
 *  Delete Review Data
 * ************************** */
revCont.deleteReview = async function (req, res, next) {
    const { review_id } = req.body
    const reviewID = parseInt(review_id)
    const updateResult = await reviewModel.deleteReview(reviewID)
    let nav = await utilities.getNav()
    const account_id = res.locals.accountData?.account_id ? parseInt(res.locals.accountData.account_id) : null
    const myReviewData = await reviewModel.getReviewsByIdOnly(account_id)
    const myReviews = await utilities.buildMyReviews(myReviewData)
    

    if (updateResult) {
        req.flash('success', `The review was successfully deleted.`)
        res.render('account/management', {
            title: 'Account Management',
            nav,
            myReviews,
            errors: null,
        })
    } else {
        req.flash('notice', 'Sorry, review not found.')
        res.render('account/management', {
            title: 'Account Management',
            nav,
            myReviews,
            errors: null,
        })
    }
}

module.exports = revCont
