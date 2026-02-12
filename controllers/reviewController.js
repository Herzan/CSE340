const invModel = require('../models/inventory-model');
const reviewModel = require('../models/review-model');
const utilities = require('../utilities/');

const reviewController = {};

/* ***************************
 *  Add Customer Review
 *************************** */
reviewController.addCustomerReview = async function (req, res) {
  const { inv_id, account_id, review_text } = req.body;

  const reviewResult = await reviewModel.addCustomerReview(
    inv_id,
    account_id,
    review_text?.trim() || ''
  );

  const vehicleData = await invModel.getInventoryById(inv_id);
  const reviewData = await reviewModel.getReviewsById(inv_id);
  const customerReviews = await utilities.buildReviews(reviewData);
  const grid = await utilities.buildDetailsGrid(vehicleData);

  const nav = await utilities.getNav();
  const className = vehicleData?.[0]
    ? `${vehicleData[0].inv_year} ${vehicleData[0].inv_make} ${vehicleData[0].inv_model}`
    : 'Vehicle Details';

  if (reviewResult) {
    req.flash('success', 'Your review has been successfully added.');
    return res.render('inventory/details', {
      title: className,
      nav,
      grid,
      customerReviews,
      inv_id,
      account_id,
      errors: null,
    });
  }

  req.flash('notice', 'Sorry, failed to add your review. Please try again.');
  return res.render('inventory/details', {
    title: className,
    nav,
    grid,
    customerReviews,
    inv_id,
    account_id,
    errors: null,
  });
};

/* ***************************
 *  Deliver Update Review View
 *************************** */
reviewController.updateReviewView = async function (req, res) {
  const review_id = parseInt(req.params.reviewId, 10);
  const account_id = res.locals.accountData?.account_id
    ? parseInt(res.locals.accountData.account_id, 10)
    : null;

  const nav = await utilities.getNav();
  const myReviewData = await reviewModel.getReviewsByIdOnly(account_id);
  const myReviews = await utilities.buildMyReviews(myReviewData);

  const reviewData = await reviewModel.getReviewsByReviewID(review_id);

  if (!reviewData || reviewData.length === 0) {
    req.flash('notice', 'Review not found.');
    return res.render('account/management', {
      title: 'Account Management',
      nav,
      myReviews,
      errors: null,
    });
  }

  const review = reviewData[0];
  const itemName = `${review.inv_year} ${review.inv_make} ${review.inv_model}`;

  const options = { year: 'numeric', month: 'long', day: 'numeric' };

  return res.render('review/edit-review', {
    title: `Edit Review – ${itemName}`,
    nav,
    review,
    review_date: review.review_date.toLocaleDateString('en-US', options),
    review_text: review.review_text,
    review_id: review.review_id,
    errors: null,
  });
};

/* ***************************
 *  Update Review Data
 *************************** */
reviewController.updateReview = async function (req, res) {
  const { review_text, review_id } = req.body;
  const reviewID = parseInt(review_id, 10);
  const newReviewText = review_text?.trim() || '';

  const updateResult = await reviewModel.updateReviews(newReviewText, reviewID);

  const nav = await utilities.getNav();

  if (updateResult && updateResult.inv_id) {
    const invData = await invModel.getInventoryById(updateResult.inv_id);
    const itemName = invData?.[0]
      ? `${invData[0].inv_year} ${invData[0].inv_make} ${invData[0].inv_model}`
      : 'Vehicle';

    req.flash('success', `Your review for ${itemName} was successfully updated.`);
    return res.redirect('/account/');
  }

  // ── Failure path ── re-fetch review data for re-render
  const reviewData = await reviewModel.getReviewsByReviewID(reviewID);

  if (!reviewData || reviewData.length === 0) {
    req.flash('notice', 'Review not found.');
    return res.redirect('/account/');
  }

  const review = reviewData[0];
  const itemName = `${review.inv_year} ${review.inv_make} ${review.inv_model}`;
  const options = { year: 'numeric', month: 'long', day: 'numeric' };

  req.flash('notice', 'Sorry, the review update failed. Please try again.');
  return res.render('review/edit-review', {
    title: `Edit Review – ${itemName}`,
    nav,
    review,
    review_date: review.review_date.toLocaleDateString('en-US', options),
    review_text: newReviewText,           // preserve what user typed
    review_id: reviewID,
    errors: null,
  });
};

/* ***************************
 *  Deliver Delete Review View
 *************************** */
reviewController.deleteReviewView = async function (req, res) {
  const review_id = parseInt(req.params.reviewId, 10);
  const account_id = res.locals.accountData?.account_id
    ? parseInt(res.locals.accountData.account_id, 10)
    : null;

  const nav = await utilities.getNav();
  const myReviewData = await reviewModel.getReviewsByIdOnly(account_id);
  const myReviews = await utilities.buildMyReviews(myReviewData);

  const reviewData = await reviewModel.getReviewsByReviewID(review_id);

  if (!reviewData || reviewData.length === 0) {
    req.flash('notice', 'Review not found.');
    return res.render('account/management', {
      title: 'Account Management',
      nav,
      myReviews,
      errors: null,
    });
  }

  const review = reviewData[0];
  const itemName = `${review.inv_year} ${review.inv_make} ${review.inv_model}`;
  const options = { year: 'numeric', month: 'long', day: 'numeric' };

  return res.render('review/delete-review', {
    title: `Delete Review – ${itemName}`,
    nav,
    review,
    review_date: review.review_date.toLocaleDateString('en-US', options),
    review_text: review.review_text,
    review_id: review.review_id,
    errors: null,
  });
};

/* ***************************
 *  Delete Review Data
 *************************** */
reviewController.deleteReview = async function (req, res) {
  const { review_id } = req.body;
  const reviewID = parseInt(review_id, 10);

  const deleteResult = await reviewModel.deleteReview(reviewID);

  const nav = await utilities.getNav();
  const account_id = res.locals.accountData?.account_id
    ? parseInt(res.locals.accountData.account_id, 10)
    : null;
  const myReviewData = await reviewModel.getReviewsByIdOnly(account_id);
  const myReviews = await utilities.buildMyReviews(myReviewData);

  if (deleteResult) {
    req.flash('success', 'The review was successfully deleted.');
    return res.render('account/management', {
      title: 'Account Management',
      nav,
      myReviews,
      errors: null,
    });
  }

  req.flash('notice', 'Sorry, the review could not be deleted (it may not exist).');
  return res.render('account/management', {
    title: 'Account Management',
    nav,
    myReviews,
    errors: null,
  });
};

module.exports = reviewController;