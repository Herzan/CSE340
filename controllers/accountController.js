const utilities = require('../utilities/');
const accountModel = require('../models/account-model');
const reviewModel = require('../models/review-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const accountController = {};

/* ****************************************
 *  Deliver Login view
 **************************************** */
accountController.buildLogin = async (req, res) => {
  const nav = await utilities.getNav();
  const loggedin = !!res.locals.accountData;
  const accountData = res.locals.accountData || null;

  res.render('account/login', {
    title: 'Login',
    nav,
    errors: null,
    loggedin,
    accountData,
  });
};

/* ****************************************
 *  Deliver Registration view
 **************************************** */
accountController.buildRegistration = async (req, res) => {
  const nav = await utilities.getNav();
  const loggedin = !!res.locals.accountData;
  const accountData = res.locals.accountData || null;

  res.render('account/registration', {
    title: 'Registration',
    nav,
    errors: null,
    loggedin,
    accountData,
  });
};

/* ****************************************
 *  Deliver Account Management view
 **************************************** */
accountController.buildManagement = async (req, res) => {
  const account_id = res.locals.accountData?.account_id
    ? parseInt(res.locals.accountData.account_id, 10)
    : null;

  const reviewData = await reviewModel.getReviewsByIdOnly(account_id);
  const myReviews = await utilities.buildMyReviews(reviewData);

  const nav = await utilities.getNav();
  const loggedin = !!res.locals.accountData;
  const accountData = res.locals.accountData || null;

  res.render('account/management', {
    title: 'Account Management',
    nav,
    myReviews,
    errors: null,
    loggedin,
    accountData,
  });
};

/* ****************************************
 *  Deliver Update Account view
 **************************************** */
accountController.buildUpdateAccountView = async (req, res) => {
  const account_id = req.params.account_id || req.params.accountId;
  const accountData = await accountModel.getAccountById(account_id);

  if (!accountData) {
    req.flash('notice', 'Account not found.');
    return res.redirect('/account/');
  }

  const nav = await utilities.getNav();
  const loggedin = !!res.locals.accountData;

  res.render('account/update-account', {
    title: 'Update Account Information',
    nav,
    errors: null,
    loggedin,
    accountData,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_type: accountData.account_type,
  });
};

/* ****************************************
 *  Process Registration
 **************************************** */
accountController.registerAccount = async (req, res) => {
  const nav = await utilities.getNav();
  const loggedin = !!res.locals.accountData;
  const accountData = res.locals.accountData || null;
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    console.error('Hashing error during registration:', error);
    req.flash('notice', 'Error processing registration.');
    return res.status(500).render('account/registration', {
      title: 'Registration',
      nav,
      errors: null,
      loggedin,
      accountData,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash('success', `Congratulations ${account_firstname}, please log in.`);
    return res.status(201).render('account/login', {
      title: 'Login',
      nav,
      errors: null,
      loggedin,
      accountData,
    });
  }

  req.flash('notice', 'Registration failed – email may already be in use.');
  return res.status(501).render('account/registration', {
    title: 'Registration',
    nav,
    errors: null,
    loggedin,
    accountData,
  });
};

/* ****************************************
 *  Process Login
 **************************************** */
accountController.accountLogin = async (req, res) => {
  const nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  const accountData = await accountModel.getAccountByEmail(account_email);
  const loggedin = !!res.locals.accountData;

  if (!accountData) {
    req.flash('notice', 'Check your credentials and try again.');
    return res.status(400).render('account/login', {
      title: 'Login',
      nav,
      errors: null,
      account_email,
      loggedin,
      accountData: null,
    });
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

      res.cookie('jwt', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 3600 * 1000,
      });

      return res.redirect('/account/');
    }

    req.flash('notice', 'Check your credentials and try again.');
    return res.status(400).render('account/login', {
      title: 'Login',
      nav,
      errors: null,
      account_email,
      loggedin,
      accountData: null,
    });
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Access Forbidden');
  }
};

/* ****************************************
 *  Process Update Account Info
 **************************************** */
accountController.updateAccountInfo = async (req, res) => {
  const nav = await utilities.getNav();
  const loggedin = !!res.locals.accountData;

  const {
    account_firstname,
    account_lastname,
    account_email,
    account_id,
  } = req.body;

  const currentAccountId = parseInt(account_id, 10);

  // Email uniqueness check
  try {
    const existing = await accountModel.checkExistingEmail(account_email.trim());

    if (existing && existing.account_id !== currentAccountId) {
      req.flash('notice', 'That email address is already in use by another account.');
      return res.status(400).render('account/update-account', {
        title: 'Update Account Information',
        nav,
        errors: null,
        loggedin,
        account_firstname,
        account_lastname,
        account_email,
        account_id: currentAccountId,
        accountData: res.locals.accountData || null,
      });
    }
  } catch (err) {
    console.error('Email check failed:', err);
    req.flash('notice', 'Server error – please try again later.');
    return res.status(500).render('account/update-account', {
      title: 'Update Account Information',
      nav,
      errors: null,
      loggedin,
      account_firstname,
      account_lastname,
      account_email,
      account_id: currentAccountId,
      accountData: res.locals.accountData || null,
    });
  }

  // Perform update
  const updatedAccount = await accountModel.updateAccountInfo(
    account_firstname.trim(),
    account_lastname.trim(),
    account_email.trim(),
    currentAccountId
  );

  if (updatedAccount) {
    // Update in-memory session data if present
    if (res.locals.accountData) {
      res.locals.accountData.account_firstname = updatedAccount.account_firstname;
      res.locals.accountData.account_lastname = updatedAccount.account_lastname;
      res.locals.accountData.account_email = updatedAccount.account_email;
    }

    req.flash('success', 'Account information updated successfully.');
    return res.redirect('/account/');
  }

  req.flash('notice', 'Failed to update account information.');
  return res.status(501).render('account/update-account', {
    title: 'Update Account Information',
    nav,
    errors: null,
    loggedin,
    account_firstname,
    account_lastname,
    account_email,
    account_id: currentAccountId,
    accountData: res.locals.accountData || null,
  });
};

/* ****************************************
 *  Process Update Password
 **************************************** */
accountController.updatePassword = async (req, res) => {
  const nav = await utilities.getNav();
  const loggedin = !!res.locals.accountData;
  const { account_password, account_id } = req.body;

  const currentAccountId = parseInt(account_id, 10);

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10); // prefer async version
  } catch (error) {
    console.error('Password hashing error:', error);
    req.flash('notice', 'Error processing password update.');
    return res.status(500).render('account/update-account', {
      title: 'Update Account Information',
      nav,
      errors: null,
      loggedin,
      accountData: res.locals.accountData || null,
    });
  }

  const result = await accountModel.updatePassword(hashedPassword, currentAccountId);

  if (result) {
    req.flash('success', 'Password updated successfully.');
    return res.redirect('/account/');
  }

  req.flash('notice', 'Password update failed.');
  return res.status(501).render('account/update-account', {
    title: 'Update Account Information',
    nav,
    errors: null,
    loggedin,
    accountData: res.locals.accountData || null,
  });
};

/* ****************************************
 *  Logout
 **************************************** */
accountController.logout = (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
};

module.exports = accountController;