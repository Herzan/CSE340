const utilities = require('../utilities/')

const errorTestController = {}

errorTestController.triggerError = async function (req, res, next) {
    throw new Error('This is a test error.')
}

module.exports = errorTestController

