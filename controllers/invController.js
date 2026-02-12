const invModel = require('../models/inventory-model');
const reviewModel = require('../models/review-model');
const utilities = require('../utilities/');

const invController = {};

/* ***************************
 *  Build inventory by classification view
 *************************** */
invController.buildByClassificationId = async function (req, res) {
  const classification_id = parseInt(req.params.classificationId, 10);
  const data = await invModel.getInventoryByClassificationId(classification_id);

  const grid = await utilities.buildClassificationGrid(data);
  const nav = await utilities.getNav();
  const className = data?.[0]?.classification_name || 'Vehicles';

  res.render('inventory/classification', {
    title: `${className} vehicles`,
    nav,
    grid,
    errors: null,
  });
};

/* ***************************
 *  Build details by InventoryID view
 *************************** */
invController.buildByInventoryID = async function (req, res) {
  const inv_id = parseInt(req.params.inventoryId, 10);
  const account_id = res.locals.accountData?.account_id
    ? parseInt(res.locals.accountData.account_id, 10)
    : null;

  const data = await invModel.getInventoryById(inv_id);
  if (!data || !data[0]) {
    req.flash('notice', 'Vehicle not found.');
    return res.redirect('/inv/');
  }

  const reviewData = await reviewModel.getReviewsById(inv_id);
  const customerReviews = await utilities.buildReviews(reviewData);
  const grid = await utilities.buildDetailsGrid(data);

  const nav = await utilities.getNav();
  const className = `${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}`;

  res.render('inventory/details', {
    title: className,
    nav,
    grid,
    customerReviews,
    inv_id,
    account_id,
    errors: null,
  });
};

/* ***************************
 *  Build Inventory Management view
 *************************** */
invController.buildManagement = async function (req, res) {
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationDropdown();

  res.render('inventory/management', {
    title: 'Inventory Management',
    nav,
    classificationSelect,
    messages: req.flash('notice'),   // using plural "messages" – common pattern
    errors: null,
  });
};

/* ***************************
 *  Build Add Classification view
 *************************** */
invController.buildAddClassification = async function (req, res) {
  const nav = await utilities.getNav();

  res.render('inventory/add-classification', {
    title: 'Add New Classification',
    nav,
    errors: null,
  });
};

/* ***************************
 *  Process Add Classification
 *************************** */
invController.addClassification = async function (req, res) {
  const { classification_name } = req.body;
  const trimmedName = (classification_name || '').trim();

  const nav = await utilities.getNav();

  try {
    const result = await invModel.addClassification(trimmedName);

    if (result) {
      req.flash('success', 'Classification added successfully.');
      return res.redirect('/inv/');
    }

    req.flash('notice', 'Failed to add classification – name may already exist.');
    return res.status(400).render('inventory/add-classification', {
      title: 'Add New Classification',
      nav,
      classification_name: trimmedName,
      errors: null,
    });
  } catch (error) {
    console.error('Add classification error:', error);
    req.flash('notice', 'An error occurred while adding the classification.');
    return res.status(500).render('inventory/add-classification', {
      title: 'Add New Classification',
      nav,
      classification_name: trimmedName,
      errors: null,
    });
  }
};

/* ***************************
 *  Build Add Inventory view
 *************************** */
invController.buildAddInventory = async function (req, res) {
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList(
    req.body?.classification_id || null
  );

  res.render('inventory/add-inventory', {
    title: 'Add New Inventory',
    nav,
    classificationSelect,
    errors: null,
  });
};

/* ***************************
 *  Process Add Inventory
 *************************** */
invController.addInventory = async function (req, res) {
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();

  try {
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
    } = req.body;

    const result = await invModel.addInventory(
      (inv_make || '').trim(),
      (inv_model || '').trim(),
      inv_year,
      inv_price,
      inv_miles,
      (inv_color || '').trim(),
      inv_description?.trim() || '',
      inv_image?.trim() || '',
      inv_thumbnail?.trim() || '',
      classification_id
    );

    if (result) {
      req.flash(
        'success',
        `Success! ${inv_year} ${inv_make} ${inv_model} was added.`
      );
      return res.redirect('/inv/');
    }

    req.flash('notice', 'Failed to add inventory item.');
    return res.status(400).render('inventory/add-inventory', {
      title: 'Add New Inventory',
      nav,
      classificationSelect,
      errors: null,
      ...req.body,
    });
  } catch (error) {
    console.error('Add inventory error:', error);
    req.flash('notice', 'An error occurred while adding inventory.');
    return res.status(500).render('inventory/add-inventory', {
      title: 'Add New Inventory',
      nav,
      classificationSelect,
      errors: null,
      ...req.body,
    });
  }
};

/* ***************************
 *  Build Edit Inventory view
 *************************** */
invController.buildByEditInventory = async function (req, res) {
  const inv_id = parseInt(req.params.inventoryId, 10);
  const itemData = await invModel.getInventoryById(inv_id);

  if (!itemData || !itemData[0]) {
    req.flash('notice', 'Vehicle not found.');
    return res.redirect('/inv/');
  }

  const item = itemData[0];
  const classificationSelect = await utilities.buildClassificationDropdown(item.classification_id);
  const nav = await utilities.getNav();
  const itemName = `${item.inv_make} ${item.inv_model}`;

  res.render('inventory/edit-inventory', {
    title: `Edit ${itemName}`,
    nav,
    classificationSelect,
    errors: null,
    inv_id: item.inv_id,
    inv_make: item.inv_make,
    inv_model: item.inv_model,
    inv_year: item.inv_year,
    inv_description: item.inv_description,
    inv_image: item.inv_image,
    inv_thumbnail: item.inv_thumbnail,
    inv_price: item.inv_price,
    inv_miles: item.inv_miles,
    inv_color: item.inv_color,
    classification_id: item.classification_id,
  });
};

/* ***************************
 *  Update Inventory Data
 *************************** */
invController.updateInventory = async function (req, res) {
  const nav = await utilities.getNav();

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
  } = req.body;

  const updateResult = await invModel.updateInventory(
    inv_id,
    (inv_make || '').trim(),
    (inv_model || '').trim(),
    inv_description?.trim() || '',
    inv_image?.trim() || '',
    inv_thumbnail?.trim() || '',
    inv_price,
    inv_year,
    inv_miles,
    (inv_color || '').trim(),
    classification_id
  );

  if (updateResult) {
    const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`;
    req.flash('success', `The ${itemName} was successfully updated.`);
    return res.redirect('/inv/');
  }

  // Failure → rebuild dropdown and re-render
  const classificationSelect = await utilities.buildClassificationDropdown(classification_id);
  const itemName = `${inv_make} ${inv_model}`;

  req.flash('notice', 'Sorry, the update failed. Please check the information.');
  return res.status(400).render('inventory/edit-inventory', {
    title: `Edit ${itemName}`,
    nav,
    classificationSelect,
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
  });
};

/* ***************************
 *  Build Delete Inventory Confirmation view
 *************************** */
invController.buildByDeleteInventory = async function (req, res) {
  const inv_id = parseInt(req.params.inventoryId, 10);
  const itemData = await invModel.getInventoryById(inv_id);

  if (!itemData || !itemData[0]) {
    req.flash('notice', 'Vehicle not found.');
    return res.redirect('/inv/');
  }

  const item = itemData[0];
  const nav = await utilities.getNav();
  const itemName = `${item.inv_make} ${item.inv_model}`;

  res.render('inventory/delete-confirm', {
    title: `Delete ${itemName}`,
    nav,
    errors: null,
    inv_id: item.inv_id,
    inv_year: item.inv_year,
    inv_make: item.inv_make,
    inv_model: item.inv_model,
    inv_price: item.inv_price,
  });
};

/* ***************************
 *  Delete Inventory Data
 *************************** */
invController.deleteInventory = async function (req, res) {
  const { inv_id } = req.body; // most important field
  const invID = parseInt(inv_id, 10);

  const deleteResult = await invModel.deleteInventory(invID);

  const nav = await utilities.getNav();

  if (deleteResult) {
    req.flash('success', 'The vehicle was successfully deleted.');
    return res.redirect('/inv/');
  }

  // On failure, try to show meaningful message
  req.flash('notice', 'Sorry, the delete failed – vehicle may not exist.');
  return res.redirect('/inv/'); // safer than re-rendering partial data
};

module.exports = invController;