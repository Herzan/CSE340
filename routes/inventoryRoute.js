// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const revController = require("../controllers/reviewController")
const utilities = require("../utilities/")
const regValidate = require("../utilities/inventory-validation")
const accMiddleware = require("../utilities/auth-middleware")

// Build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// Inventory Management view (PROTECTED – MAIN)
router.get(
  "/",
  accMiddleware.checkEmployeeOrAdmin,  // Or utilities.checkAccountType if that's your var
  utilities.handleErrors(invController.buildManagement)
);
// Build details by Inventory ID view
router.get(
  "/detail/:inventoryId",
  utilities.handleErrors(invController.buildByInventoryID)
)

// Add Classification view
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildByAddClassification)
)

// Process Add Classification
router.post(
  "/add-classification",
  regValidate.classificationRules(),
  regValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Add Inventory view
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildByAddInventory)
)

// Process Add Inventory
router.post(
  "/add-inventory",
  regValidate.inventoryRules(),
  regValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Get inventory JSON
router.get(
  "/getInventory/:classification_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.getInventoryJSON)
)

// Edit Inventory view
router.get(
  "/edit/:inventoryId",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildByEditInventory)
)

// Update Inventory
router.post(
  "/update",
  regValidate.inventoryRules(),
  regValidate.checkInventoryData,
  utilities.handleErrors(invController.updateInventory)
)

// Delete Inventory view
router.get(
  "/delete/:inventoryId",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildByDeleteInventory)
)

// Process Delete Inventory
router.post(
  "/delete",
  utilities.handleErrors(invController.deleteInventory)
)

module.exports = router
