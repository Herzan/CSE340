// Needed Resources
const express = require('express')
const router = new express.Router()
const utilities = require('../utilities/')
const revController = require('../controllers/reviewController')
const regValidate = require('../utilities/review-validation')

/* ***********************
 * Route to handle Add Customer Review
 *************************/
router.post(
    '/add-review/',
    utilities.checkLogin,
    regValidate.reviewRules(),
    regValidate.checkAddReviewData,
    utilities.handleErrors(revController.addCustomerReview)
)


/* ***********************
 * Route to build Edit Review View
 *************************/
router.get('/edit-review/:reviewId', utilities.checkLogin, utilities.handleErrors(revController.updateReviewView))

/* ***********************
 * Route to handle Edit Review View
 *************************/
router.post(
    '/update-review/',
    regValidate.reviewRules(),
    regValidate.checkReviewData,
    utilities.handleErrors(revController.updateReview)
)

/* ***********************
 * Route to build Delete Review View
 *************************/
router.get('/delete-review/:reviewId', utilities.checkLogin, utilities.handleErrors(revController.deleteReviewView))

/* ***********************
 * Route to handle Edit Review View
 *************************/
router.post('/delete-review/', utilities.handleErrors(revController.deleteReview))

module.exports = router
