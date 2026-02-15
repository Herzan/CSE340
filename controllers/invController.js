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

  let itemData = await invModel.getInventoryById(inv_id);
  let reviewData = await reviewModel.getReviewsById(inv_id, account_id);
  const customerReviews = await utilities.buildReviews(reviewData);
  const grid = await utilities.buildDetailsGrid(itemData);
  const nav = await utilities.getNav();

  // Redirect if no item found
  if (!itemData[0]) {
    req.flash('notice', 'Sorry, that inventory item does not exist.');
    return res.redirect('/inv/');
  }

  const item = itemData[0];
  const itemName = `${item.inv_make} ${item.inv_model}`;

  res.render('inventory/details', {
    title: `${item.inv_year} ${itemName}`,
    nav,
    grid,
    customerReviews,
    inv_id: item.inv_id,
    account_id,  // For logged-in users to add reviews
    errors: null,
  });
};

/* ***************************
 *  Build Inventory Management View (Admin/Employee Only)
 *************************** */
invController.buildManagement = async function (req, res) {
  const nav = await utilities.getNav();
  res.render('inventory/management', {  // <-- FIXED HERE
    title: 'Vehicle Management',
    nav,
    message: null,
    errors: null,
  });
};

/* ***************************
 *  Build Add Classification View
 *************************** */
invController.buildByAddClassification = async function (req, res) {
  const nav = await utilities.getNav();
  res.render('inventory/add-classification', {
    title: 'Add New Vehicle Classification',
    nav,
    errors: null,
  });
};

/* ***************************
 *  Add New Classification
 *************************** */
invController.addClassification = async function (req, res) {
  const { classification_name } = req.body;
  const result = await invModel.addClassification(classification_name);

  const nav = await utilities.getNav();
  if (result) {
    req.flash('success', `Classification "${classification_name}" added successfully.`);
    return res.redirect('/inv/');
  }

  req.flash('notice', 'Sorry, that classification could not be added.');
  return res.status(501).render('inventory/add-classification', {
    title: 'Add New Vehicle Classification',
    nav,
    errors: null,
  });
};

/* ***************************
 *  Build Add Inventory View
 *************************** */
invController.buildByAddInventory = async function (req, res) {
  const classificationList = await utilities.buildClassificationList();
  const nav = await utilities.getNav();

  res.render('inventory/add-inventory', {
    title: 'Add New Vehicle',
    nav,
    classificationSelect: classificationList,
    errors: null,

    // Add these defaults (prevents ReferenceError even without locals.)
    inv_make: '',
    inv_model: '',
    inv_year: '',
    inv_description: '',
    inv_image: '/images/no-image.jpg',     // or whatever default
    inv_thumbnail: '/images/no-image-tn.jpg',
    inv_price: '',
    inv_miles: '',
    inv_color: '',
  });
};

/* ***************************
 *  Add New Inventory Item
 *************************** */
invController.addInventory = async function (req, res) {
  const {
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
  } = req.body;

  const inv_id = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    parseInt(classification_id)
  );

  const nav = await utilities.getNav();
  if (inv_id) {
    req.flash('success', `Congratulations on adding ${inv_make} ${inv_model}.`);
    return res.redirect('/inv/');
  }

  req.flash('notice', 'Sorry, we could not add the vehicle.');
  const classificationList = await utilities.buildClassificationList(classification_id);
  return res.status(501).render('inventory/add-inventory', {
    title: 'Add New Vehicle',
    nav,
    classificationSelect: classificationList,
    errors: null,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  });
};

/* ***************************
 *  Get Inventory JSON
 *************************** */
invController.getInventoryJSON = async function (req, res) {
  const classification_id = parseInt(req.params.classification_id, 10);
  const itemData = await invModel.getInventoryByClassificationId(classification_id);
  res.json(itemData);
};

/* ***************************
 *  Build Edit Inventory View
 *************************** */
invController.buildByEditInventory = async function (req, res) {
  const inv_id = parseInt(req.params.inventoryId, 10);
  const itemData = await invModel.getInventoryById(inv_id);
  const classificationSelect = await utilities.buildClassificationList(itemData[0].classification_id);

  const nav = await utilities.getNav();
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`;

  res.render('inventory/edit-inventory', {
    title: `Edit ${itemName}`,
    nav,
    classificationSelect,
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
  });
};

/* ***************************
 *  Update Inventory Item
 *************************** */
invController.updateInventory = async function (req, res) {
  const {
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
  } = req.body;

  const itemData = await invModel.updateInventory(
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    parseInt(classification_id),
    parseInt(inv_id)
  );

  const nav = await utilities.getNav();
  if (itemData) {
    req.flash('success', `The ${inv_make} ${inv_model} has been updated.`);
    return res.redirect(`/inv/detail/${inv_id}`);
  }

  req.flash('notice', 'Sorry, we could not update the vehicle.');
  const classificationSelect = await utilities.buildClassificationList(classification_id);
  const itemName = `${inv_make} ${inv_model}`;
  return res.status(501).render('inventory/edit-inventory', {
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
  });
};

/* ***************************
 *  Build Delete Inventory Confirm View
 *************************** */
invController.buildByDeleteInventory = async function (req, res) {
  const inv_id = parseInt(req.params.inventoryId, 10);
  const itemData = await invModel.getInventoryById(inv_id);

  if (!itemData[0]) {
    req.flash('notice', 'Sorry, that inventory item does not exist.');
    return res.redirect('/inv/');
  }

  const nav = await utilities.getNav();
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`;

  res.render('inventory/delete-confirm', {
    title: `Delete ${itemName}`,
    nav,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_year: itemData[0].inv_year,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_price: itemData[0].inv_price,
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