// Needed Resources
const express = require('express')
const router = new express.Router()
const invController = require('../controllers/invController')
const revController = require('../controllers/reviewController')
const utilities = require('../utilities/')
const regValidate = require('../utilities/inventory-validation')

// Route to build inventory by classification view
router.get('/type/:classificationId', utilities.handleErrors(invController.buildByClassificationId))

// Route to build details by InventoryID view
router.get('/detail/:inventoryId', utilities.handleErrors(invController.buildByInventoryID))

// Route to build Inventory Management view
router.get('/', utilities.checkAccountType, utilities.handleErrors(invController.buildByInvManagement))

// Route to build Add Classification View
router.get('/add-classification', utilities.handleErrors(invController.buildByAddClassification))

// Route to handle Add Classification
router.post(
    '/add-classification',
    regValidate.classificationRules(),
    regValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

// Route to build Add Inventory View
router.get('/add-inventory', utilities.handleErrors(invController.buildByAddInventory))

// Route to handle Add Inventory
router.post(
    '/add-inventory',
    regValidate.inventoryRules(),
    regValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)

// Route to build Get Inventory View
router.get(
    '/getInventory/:classification_id',
    utilities.checkAccountType,
    utilities.handleErrors(invController.getInventoryJSON)
)

// Route to build Edit Inventory View
router.get('/edit/:inventoryId', utilities.checkAccountType, utilities.handleErrors(invController.buildByEditInventory))

// Route to handle Edit/Update Inventory
router.post(
    '/update/',
    regValidate.inventoryRules(),
    regValidate.checkInventoryData,
    utilities.handleErrors(invController.updateInventory)
)

// Route to build Delete Inventory View
router.get(
    '/delete/:inventoryId',
    utilities.checkAccountType,
    utilities.handleErrors(invController.buildByDeleteInventory)
)

// Route to handle Delete Inventory
router.post('/delete/', utilities.handleErrors(invController.deleteInventory))


module.exports = router
