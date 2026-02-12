const utilities = {}

/* ****************************************
 * Check if user is Employee or Admin
 * **************************************** */
utilities.checkEmployeeOrAdmin = (req, res, next) => {
  try {
    if (
      res.locals.loggedin === true &&
      res.locals.accountData &&
      (res.locals.accountData.account_type === "Employee" ||
       res.locals.accountData.account_type === "Admin")
    ) {
      return next()
    }

    req.flash("notice", "You must be logged in as an Employee or Admin to access this area.")
    return res.redirect("/account/login")
  } catch (error) {
    console.error("Authorization error:", error)
    req.flash("notice", "Authorization failed.")
    return res.redirect("/account/login")
  }
}

module.exports = utilities
