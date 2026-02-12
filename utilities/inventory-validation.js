const utilities = require("./")
const { body, validationResult } = require("express-validator")
const inventoryModel = require("../models/inventory-model")

const validate = {}

/* **********************************
 * Classification Validation Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .matches(/^[A-Za-z]+$/)
      .withMessage("Classification does not meet requirements.")
      .customSanitizer(name =>
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
      )
      .custom(async classification_name => {
        const exists =
          await inventoryModel.checkExistingClassification(classification_name)
        if (exists) {
          throw new Error(
            "Classification exists. Please enter a different classification."
          )
        }
      }),
  ]
}

/* ******************************
 * Check Classification Data
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("inventory/add-classification", {
      title: "Add Classification Management",
      nav,
      errors,
      classification_name: req.body.classification_name,
    })
  }

  next()
}

/* **********************************
 * Inventory Validation Rules (MERGED)
 * ********************************* */
validate.inventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Classification is required."),

    body("inv_make")
      .trim()
      .escape()
      .isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters.")
      .customSanitizer(make =>
        make
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ")
      ),

    body("inv_model")
      .trim()
      .escape()
      .isLength({ min: 3 })
      .withMessage("Model must be at least 3 characters.")
      .customSanitizer(model =>
        model
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ")
      ),

    body("inv_year")
      .trim()
      .isInt({ min: 1900, max: 2099 })
      .withMessage("Year must be a valid 4-digit year."),

    body("inv_price")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Price must be a valid number."),

    body("inv_miles")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Miles must be numeric."),

    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Color is required.")
      .customSanitizer(color =>
        color
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ")
      ),

    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Description must not be empty."),
  ]
}

/* ******************************
 * Check Inventory Data
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationSelect =
      await utilities.buildClassificationList(req.body.classification_id)

    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect,
      errors,
      ...req.body,
    })
  }

  next()
}

/* ******************************
 * Check Update Inventory Data
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationSelect =
      await utilities.buildClassificationList(req.body.classification_id)

    return res.render("inventory/edit-inventory", {
      title: "Edit Inventory",
      nav,
      classificationSelect,
      errors,
      ...req.body,
    })
  }

  next()
}

module.exports = validate
