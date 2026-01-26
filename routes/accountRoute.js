// Needed Resources
const express = require('express')
const router = new express.Router()
const utilities = require('../utilities/')
const accountController = require('../controllers/accountController')
const regValidate = require('../utilities/account-validation')

/* ***********************
 * Route to build Login View
 *************************/
router.get('/login', utilities.handleErrors(accountController.buildLogin))

/* ***********************
 * Process the login attempt
 *************************/
router.post(
    '/login',
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

/* ***********************
 * Route to build Registration View
 *************************/
router.get('/registration', utilities.handleErrors(accountController.buildRegistration))

/* ***********************
 * Route to handle Registration
 *************************/
router.post(
    '/registration',
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

/* ***********************
 * Route to build Account Management View
 *************************/
router.get('/', utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

/* ***********************
 * Route to build Update Account View
 *************************/
router.get(
    '/update/:account_id',
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildUpdateAccountView)
)

/* ***********************
 * Update Account Information
 *************************/
router.post(
    '/update-user-info/',
    utilities.checkLogin,
    regValidate.updateRegistrationRules(),
    regValidate.checkUpdateRegData,
    utilities.handleErrors(accountController.updateAccountInfo)
)

/* ***********************
 * Change Password
 *************************/
router.post(
    '/update-user-password/',
    utilities.checkLogin,
    regValidate.updatePasswordRules(),
    regValidate.checkPasswordData,
    utilities.handleErrors(accountController.updatePassword)
)

/* ***********************
 * Route to build Logout View
 *************************/
router.get("/logout", utilities.handleErrors(accountController.logout));

module.exports = router
