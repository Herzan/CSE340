// Needed Resources
const express = require('express')
const router = new express.Router()
const utilities = require('../utilities/')
const errorTestController = require('../controllers/errorTestController')

// Route to build Login View
router.get('/error', utilities.handleErrors(errorTestController.triggerError))


module.exports = router
