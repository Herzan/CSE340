const invModel = require('../models/inventory-model')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    // console.log(data)
    let list = '<ul>'
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += '<li>'
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            '</a>'
        list += '</li>'
    })
    list += '</ul>'
    return list
}

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
    let grid
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach((vehicle) => {
            grid += '<li>'
            grid +=
                '<a href="../../inv/detail/' +
                vehicle.inv_id +
                '" title="View ' +
                vehicle.inv_make +
                ' ' +
                vehicle.inv_model +
                'details"><img src="' +
                vehicle.inv_thumbnail +
                '" alt="Image of ' +
                vehicle.inv_make +
                ' ' +
                vehicle.inv_model +
                ' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid +=
                '<a href="../../inv/detail/' +
                vehicle.inv_id +
                '" title="View ' +
                vehicle.inv_make +
                ' ' +
                vehicle.inv_model +
                ' details">' +
                vehicle.inv_make +
                ' ' +
                vehicle.inv_model +
                '</a>'
            grid += '</h2>'
            grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/* **************************************
 * Build the details view HTML
 * ************************************ */
Util.buildDetailsGrid = async function (data) {
    let grid
    if (data.length > 0) {
        grid = '<article id="details-display">'
        grid +=
            '<img src="' +
            data[0].inv_image +
            '" alt="Image of ' +
            data[0].inv_make +
            ' ' +
            data[0].inv_model +
            ' on CSE Motors" />'
        grid += '<div id="details-info">'
        grid += '<h2>' + data[0].inv_make + ' ' + data[0].inv_model + ' ' + 'Details</h2>'
        grid += '<p class="price">Price: $' + new Intl.NumberFormat('en-US').format(data[0].inv_price) + '</p>'
        grid += '<p class="description"><strong>Description:</strong> ' + data[0].inv_description + '</p>'
        grid += '<ul class="details-list">'
        grid += '<li><span class="checkbox"></span><strong>Year:</strong> &nbsp;' + data[0].inv_year + '</li>'
        grid += '<li><span class="checkbox"></span><strong>Make:</strong> &nbsp;' + data[0].inv_make + '</li>'
        grid += '<li><span class="checkbox"></span><strong>Model:</strong> &nbsp;' + data[0].inv_model + '</li>'
        grid += '<li><span class="checkbox"></span><strong>Color:</strong> &nbsp;' + data[0].inv_color + '</li>'
        grid +=
            '<li><span class="checkbox"></span><strong>Mileage:</strong> &nbsp;' +
            new Intl.NumberFormat('en-US').format(data[0].inv_miles) +
            '</li>'
        grid +=
            '<li><span class="checkbox"></span><strong>Classification:</strong> &nbsp;' +
            data[0].classification_name +
            '</li>'
        grid += '</ul>'
        grid += '</div>'
        grid += '</article>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles details could be found.</p>'
    }
    return grid
}

/* **************************************
 * Build Error view HTML
 * ************************************ */
Util.buildErrorMessage = (heading, quote) => `
<section id="error-page">
  <img src="/images/site/pexels-pixabay-78793.jpg" alt="404 Error Image - broken car" />
  <div class="error-message">
    <h2>${heading}</h2>
    <p class="notice">${quote}</p>
  </div>
</section>`;

/* ************************
 * Constructs the Classification HTML select dropdown
 ************************** */
Util.buildClassificationList = async function (classification_id = null) {
  const data = await invModel.getClassifications()

  let select = `
    <select 
      id="classification_id" 
      name="classification_id" 
      required
    >
      <option value="" disabled ${!classification_id ? 'selected' : ''}>
        Choose a Classification
      </option>
  `

  data.rows.forEach((row) => {
    const selected = Number(classification_id) === row.classification_id ? 'selected' : ''
    select += `
      <option value="${row.classification_id}" ${selected}>
        ${row.classification_name}
      </option>
    `
  })

  select += `</select>`
  return select
}

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, function (err, accountData) {
            if (err) {
                req.flash('Please log in')
                res.clearCookie('jwt')
                return res.redirect('/account/login')
            }
            res.locals.accountData = accountData
            res.locals.loggedin = 1
            next()
        })
    } else {
        next()
    }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next()
    } else {
        req.flash('notice', 'Please log in.')
        return res.redirect('/account/login')
    }
}

/* ****************************************
 * Middleware to check account type for access
 **************************************** */
Util.checkAccountType = (req, res, next) => {
    const redirectToLogin = (message) => {
        req.flash('notice', message)
        // res.clearCookie("jwt");
        return res.redirect('/account/login')
    }

    const verifyToken = (token) => {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
                if (err) return reject(err)
                resolve(accountData)
            })
        })
    }

    if (!req.cookies.jwt) {
        return redirectToLogin('You are not logged in. Please log in to access this page.')
    }

    verifyToken(req.cookies.jwt)
        .then((accountData) => {
            const { account_type, account_firstname } = accountData

            if (account_type === 'admin' || account_type === 'employee') {
                req.flash(
                    'success',
                    `Welcome back, ${account_firstname}! You are successfully logged in as an ${account_type}.`
                )
                res.locals.accountData = accountData
                res.locals.loggedin = true
                return next()
            }

            if (account_type === 'client') {
                return redirectToLogin(
                    `Sorry, ${account_firstname}. You must be logged in as an Employee or Admin to access this page.`
                )
            }

            // Handle unexpected account types
            return redirectToLogin('Your account type is not authorized to access this page. Please contact support.')
        })
        .catch((err) => {
            console.error('JWT verification error:', err)
            return redirectToLogin('Your session has expired or is invalid. Please log in again.')
        })
}

/* ****************************************
 * Build view for reviews
 **************************************** */
Util.buildReviews = async function (data) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }

    // Return a default message if there are no reviews
    if (!data || data.length === 0) {
        return '<p class="zero-review">Be the first to write a review for this vehicle.</p>'
    }

     // Sort the data by review_date in descending order (most recent first)
     data.sort((a, b) => new Date(b.review_date) - new Date(a.review_date))

    // Build the review list
    const reviewList = data
        .map((row) => {
            const firstInitial = row.account_firstname?.charAt(0).toUpperCase() || ''
            const lastName = row.account_lastname || ''
            const screenName = `${firstInitial}${lastName}`
            const reviewDate = new Date(row.review_date).toLocaleDateString('en-US', options)
            const reviewText = row.review_text || 'No review text provided.'

            return `
        <li>
            <div class="review-display">
                <p><strong>${screenName}</strong> wrote on ${reviewDate}</p>
                <hr/>
                <p>${reviewText}</p>
            </div>
        </li>`
        })
        .join('')

    return `<ul class="review-list">${reviewList}</ul>`
}

/* ****************************************
 * Build view for My reviews - account management page
 **************************************** */
Util.buildMyReviews = async function (data) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }

    // Return a default message if there are no reviews
    if (!data || data.length === 0) {
        return '<p class="zero-review">You have no reviews.</p>'
    }

     // Sort the data by review_date in descending order (most recent first)
     data.sort((a, b) => new Date(b.review_date) - new Date(a.review_date))

    // Build the review list
    const reviewList = data
        .map((row) => {
            const reviewDate = new Date(row.review_date).toLocaleDateString('en-US', options)

            return `
        <li>
            <div class="my-review-display">
                <p>Reviewed the <strong>${row.inv_year} ${row.inv_make} ${row.inv_model}</strong> on ${reviewDate}</p>
                <div class="my-review-links">
                <a href='/inv/detail/${row.inv_id}' class='btn btn-view-auto' title='Click to view'>View</a>
                    <a href='/review/edit-review/${row.review_id}' class='btn btn-mod-auto' title='Click to update'>Edit</a>
                    <a href='/review/delete-review/${row.review_id}' class='btn btn-del-auto' title='Click to delete'>Delete</a>
                </div>
            </div>
        </li>`
        })
        .join('')

    return `<ol type="1" class="my-list">${reviewList}</ol>`
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util
