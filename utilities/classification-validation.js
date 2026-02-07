const { body, validationResult } = require("express-validator")

exports.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isAlphanumeric()
      .withMessage("No spaces or special characters allowed.")
  ]
}

exports.checkClassificationData = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      errors,
      nav: res.locals.nav
    })
  }
  next()
}
