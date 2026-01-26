function triggerError(req, res, next) {
  throw new Error("Intentional Server Error")
}

module.exports = { triggerError }
