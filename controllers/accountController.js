const utilities = require('../utilities/')
const accountModel = require('../models/account-model')
const reviewModel = require('../models/review-model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const accountController = {}

/* ****************************************
 *  Deliver Login view
 * *************************************** */
accountController.buildLogin = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render('account/login', {
        title: 'Login',
        nav,
        errors: null,
    })
}

/* ****************************************
 *  Deliver Registration view
 * *************************************** */
accountController.buildRegistration = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render('account/registration', {
        title: 'Registration',
        nav,
        errors: null,
    })
}

/* ****************************************
 *  Deliver Account Management view
 * *************************************** */
accountController.buildManagement = async function (req, res, next) {
    const account_id = res.locals.accountData?.account_id ? parseInt(res.locals.accountData.account_id) : null
    const reviewData = await reviewModel.getReviewsByIdOnly(account_id)
    const myReviews = await utilities.buildMyReviews(reviewData)
    let nav = await utilities.getNav()
    res.render('account/management', {
        title: 'Account Management',
        nav,
        myReviews,
        errors: null,
    })
}

/* ****************************************
 *  Process Registration
 * *************************************** */
accountController.registerAccount = async function (req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash('notice', 'Sorry, there was an error processing the registration.')
        res.status(500).render('account/register', {
            title: 'Registration',
            nav,
            errors: null,
        })
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash('success', `Congratulations, you\'re registered ${account_firstname}. Please log in.`)
        res.status(201).render('account/login', {
            title: 'Login',
            nav,
            errors: null,
        })
    } else {
        req.flash('notice', 'Sorry, the registration failed.')
        res.status(501).render('account/registration', {
            title: 'Registration',
            nav,
            errors: null,
        })
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountLogin = async function (req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash('notice', 'Please check your credentials and try again.')
        res.status(400).render('account/login', {
            title: 'Login',
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            if (process.env.NODE_ENV === 'development') {
                res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie('jwt', accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            return res.redirect('/account/')
        } else {
            req.flash('message notice', 'Please check your credentials and try again.')
            res.status(400).render('account/login', {
                title: 'Login',
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        throw new Error('Access Forbidden')
    }
}

/* ***********************
 * Deliver Update Account View
 *************************/
accountController.buildUpdateAccountView = async function (req, res) {
    let nav = await utilities.getNav()
    const accountData = await accountModel.getAccountById(req.params.account_id)
    res.render('account/update-account', {
        title: 'Update Account Information',
        nav,
        accountData,
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_type: accountData.account_type,
        errors: null,
    })
}

/* ***********************
 * Process Update Account
 *************************/
accountController.updateAccountInfo = async function (req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_id } = req.body
    const updateResult = await accountModel.updateAccountInfo(
        account_firstname,
        account_lastname,
        account_email,
        account_id
    )
    if (updateResult) {
        req.flash('success', 'Account Information updated successfully.')
        res.redirect('/account/')
    } else {
        req.flash('notice', 'Failed to update Account Information.')
        res.status(501).render('account/update-account', {
            title: 'Update Account Information',
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email,
            account_id,
        })
        return
    }
    next()
}

/* ****************************************
 *  Update Account Password
 * *************************************** */
accountController.updatePassword = async function (req, res) {
    let nav = await utilities.getNav()
    const { account_password, account_id } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash('notice', 'Sorry, there was an error updating your password.')
        res.status(500).render('account/update-account', {
            title: 'Update Account Information',
            nav,
            errors: null,
        })
    }

    const regResult = await accountModel.updatePassword(hashedPassword, account_id)

    if (regResult) {
        req.flash('success', `Your password has been updated.`)
        res.redirect('/account/')
    } else {
        req.flash('notice', 'Sorry, your update password has failed.')
        res.status(501).render('account/update-account', {
            title: 'Update Account Information',
            nav,
            errors: null,
        })
    }
}

/* ****************************************
 *  Process Logout
 * *************************************** */
accountController.logout = async function (req, res) {
    res.clearCookie('jwt')
    res.redirect('/')
}

module.exports = accountController
