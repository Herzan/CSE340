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
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationDropdown()

  res.render('inventory/management', {
    title: 'Inventory Management',
    nav,
    classificationSelect,
    messages: req.flash('notice'),
    errors: null,
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
 *  Process Add Classification (MERGED)
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const nav = await utilities.getNav()

  try {
    const result = await invModel.addClassification(classification_name)

    if (result) {
      req.flash('notice', 'Classification added successfully.')

      // Works for both redirect-based and render-based flows
      res.redirect('/inv/')
    } else {
      req.flash('notice', 'Failed to add classification.')

      res.status(501).render('inventory/add-classification', {
        title: 'Add Classification Management',
        nav,
        classification_name,
        errors: null,
      })
    }
  } catch (error) {
    req.flash('notice', 'An error occurred while adding the classification.')

    res.status(500).render('inventory/add-classification', {
      title: 'Add Classification Management',
      nav,
      classification_name,
      errors: null,
    })
  }
}

/* ***************************
 *  Build Add Inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res) {
  const nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()

  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationSelect,
    errors: null
  })
}

/* ***************************
 *  Process Add Inventory (MERGED – no deletions)
 * ************************** */
invCont.addInventory = async function (req, res, next) {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationDropdown()

    try {
        // Support both styles: explicit fields OR req.body
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

        const result = await invModel.addInventory(
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

        if (result) {
            req.flash(
                'notice',
                `Success, ${inv_year} ${inv_make} ${inv_model} was added successfully.`
            )

            // ✅ Works with both redirect-based and render-based flows
            return res.redirect('/inv/')
        }

        // ❌ Insert failed
        req.flash('notice', 'Failed to add inventory item.')

        res.status(501).render('inventory/add-inventory', {
            title: 'Add Inventory',
            nav,
            classificationSelect,
            errors: null,
            ...req.body, // ✅ sticky fields
        })
    } catch (error) {
        console.error(error)

        req.flash('notice', 'An error occurred while adding inventory.')

        res.status(500).render('inventory/add-inventory', {
            title: 'Add Inventory',
            nav,
            classificationSelect,
            errors: null,
            ...req.body, // ✅ sticky fields
        })
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
        const classificationSelect = await utilities.buildClassificationDropdown(classification_id)

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

invCont.buildManagement = async function (req, res) {
  const nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: req.flash("notice")
  })
}

/* ***************************
 *  End
 * ************************** */
module.exports = invCont
