const invModel = require('../models/inventory-model')
const reviewModel = require('../models/review-model')
const utilities = require('../utilities/')

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render('inventory/classification', {
        title: className + ' vehicles',
        nav,
        grid,
        errors: null,
    })
}

/* ***************************
 *  Build details by InventoryID view
 * ************************** */
invCont.buildByInventoryID = async function (req, res, next) {
    const inv_id = parseInt(req.params.inventoryId)
    const account_id = res.locals.accountData?.account_id ? parseInt(res.locals.accountData.account_id) : null
    const data = await invModel.getInventoryById(inv_id)
    const reviewData = await reviewModel.getReviewsById(inv_id)
    const customerReviews = await utilities.buildReviews(reviewData)
    const grid = await utilities.buildDetailsGrid(data)
    let nav = await utilities.getNav()
    const className = `${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}`
    res.render('inventory/details', {
        title: className,
        nav,
        grid,
        customerReviews,
        inv_id,
        account_id,
        errors: null,
    })
}

/* ***************************
 *  Build Inventory Management view
 * ************************** */
invCont.buildByInvManagement = async function (req, res, next) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationDropdown()
    res.render('inventory/management', {
        title: 'Inventory Management',
        nav,
        errors: null,
        classificationSelect,
    })
}

/* ***************************
 *  Build Add Classification view
 * ************************** */
invCont.buildByAddClassification = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render('inventory/add-classification', {
        title: 'Add Classification Management',
        nav,
        errors: null,
    })
}

/* ***************************
 *  Process Add Classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
    const { classification_name } = req.body
    const regResult = await invModel.addClassification(classification_name)
    let nav = await utilities.getNav()

    if (regResult) {
        req.flash('success', `Success, ${classification_name} has been added to the database.`)
        res.status(201).render('inventory/management', {
            title: 'Inventory Management',
            nav,
            errors: null,
        })
    } else {
        req.flash('notice', 'Sorry, adding classification failed.')
        res.status(501).render('./inventory/add-classification', {
            title: 'Add Classification Management',
            nav,
            errors: null,
        })
    }
}

/* ***************************
 *  Build Add Inventory view
 * ************************** */
invCont.buildByAddInventory = async function (req, res, next) {
    const classificationSelect = await utilities.buildClassificationDropdown()
    let nav = await utilities.getNav()
    res.render('inventory/add-inventory', {
        title: 'Add Inventory Management',
        nav,
        classificationSelect,
        errors: null,
    })
}

/* ***************************
 *  Process Add Inventory
 * ************************** */
invCont.addInventory = async function (req, res, next) {
    const {
        inv_make,
        inv_model,
        inv_year,
        inv_price,
        inv_miles,
        inv_color,
        inv_description,
        inv_image,
        inv_thumbnail,
        classification_id,
    } = req.body
    // console.log(req.body)

    const regResult = await invModel.addInventory(
        inv_make,
        inv_model,
        inv_year,
        inv_price,
        inv_miles,
        inv_color,
        inv_description,
        inv_image,
        inv_thumbnail,
        classification_id
    )

    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationDropdown()

    if (regResult) {
        req.flash('success', `Success, ${inv_year} ${inv_make} ${inv_model} has been added to the database.`)
        res.status(201).render('inventory/management', {
            title: 'Inventory Management',
            nav,
            classificationSelect,
            errors: null,
        })
    } else {
        req.flash('notice', 'Sorry, adding inventory failed.')
        res.status(501).render('inventory/add-inventory', {
            title: 'Add Inventory Management',
            nav,
            classificationSelect,
            errors: null,
        })
    }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error('No data returned'))
    }
}

/* ***************************
 *  Build Edit/Update Inventory view
 * ************************** */
invCont.buildByEditInventory = async (req, res, next) => {
    const inv_id = parseInt(req.params.inventoryId)
    const itemData = await invModel.getInventoryById(inv_id)
    const classificationSelect = await utilities.buildClassificationDropdown(itemData[0].classification_id)
    let nav = await utilities.getNav()
    const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
    res.render('inventory/edit-inventory', {
        title: `Edit Inventory - ${itemName}`,
        nav,
        classificationSelect: classificationSelect,
        errors: null,
        inv_id: itemData[0].inv_id,
        inv_make: itemData[0].inv_make,
        inv_model: itemData[0].inv_model,
        inv_year: itemData[0].inv_year,
        inv_description: itemData[0].inv_description,
        inv_image: itemData[0].inv_image,
        inv_thumbnail: itemData[0].inv_thumbnail,
        inv_price: itemData[0].inv_price,
        inv_miles: itemData[0].inv_miles,
        inv_color: itemData[0].inv_color,
        classification_id: itemData[0].classification_id,
    })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    const {
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
    } = req.body
    const updateResult = await invModel.updateInventory(
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id
    )

    if (updateResult) {
        const itemName = updateResult.inv_make + ' ' + updateResult.inv_model
        req.flash('success', `The ${itemName} was successfully updated.`)
        res.redirect('/inv/')
    } else {
        const classificationSelect = await utilities.buildClassificationList(classification_id)
        const itemName = `${inv_make} ${inv_model}`
        req.flash('notice', 'Sorry, the insert failed.')
        res.status(501).render('inventory/edit-inventory', {
            title: 'Edit ' + itemName,
            nav,
            classificationSelect: classificationSelect,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
        })
    }
}

/* ***************************
 *  Build Delete Inventory view
 * ************************** */
invCont.buildByDeleteInventory = async (req, res, next) => {
    const inv_id = parseInt(req.params.inventoryId)
    const itemData = await invModel.getInventoryById(inv_id)
    let nav = await utilities.getNav()
    const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
    res.render('inventory/delete-confirm', {
        title: `Delete Inventory - ${itemName}`,
        nav,
        errors: null,
        inv_id: itemData[0].inv_id,
        inv_year: itemData[0].inv_year,
        inv_make: itemData[0].inv_make,
        inv_model: itemData[0].inv_model,
        inv_price: itemData[0].inv_price,
    })
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    const { inv_id, inv_make, inv_model, inv_price, inv_year, inv_miles } = req.body
    const updateResult = await invModel.deleteInventory(inv_id, inv_make, inv_model, inv_price, inv_year, inv_miles)

    if (updateResult) {
        req.flash('success', `The Vehicle was successfully deleted.`)
        res.redirect('/inv/')
    } else {
        const itemName = `${inv_make} ${inv_model}`
        req.flash('notice', 'Sorry, the delete failed.')
        res.status(501).render('inventory/delete-confirm', {
            title: 'Edit ' + itemName,
            nav,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_price,
            inv_miles,
        })
    }
}


module.exports = invCont
