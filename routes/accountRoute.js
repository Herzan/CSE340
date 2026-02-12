// Required Resources
const express = require('express')
const router = new express.Router()
const utilities = require('../utilities/')
const accountController = require('../controllers/accountController')
const regValidate = require('../utilities/account-validation')

/* ***********************
 * Login Routes
 *************************/
// Build Login View
router.get('/login', utilities.handleErrors(accountController.buildLogin))

// Process Login
router.post(
  '/login',
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

/* ***********************
 * Registration Routes
 *************************/
// Build Registration View
router.get(
  '/registration',
  utilities.handleErrors(accountController.buildRegistration)
)

// Process Registration
router.post(
  '/registration',
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

/* ***********************
 * Account Management Routes
 *************************/
// Build Account Management View (requires login)
router.get(
  '/',
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildManagement)
)

/* ***********************
 * Update Account Routes
 *************************/
// Build Update Account View
router.get(
  '/update/:account_id',
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccountView)
)

// Process Update Account Information
router.post(
  '/update-user-info',
  utilities.checkLogin,
  regValidate.updateRegistrationRules(),
  regValidate.checkUpdateRegData,
  utilities.handleErrors(accountController.updateAccountInfo)
)

// Process Update Password
router.post(
  '/update-user-password',
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

/* ***********************
 * Logout Route
 *************************/
router.get(
  '/logout',
  utilities.handleErrors(accountController.logout)
)

module.exports = router
