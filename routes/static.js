/* ****************************
 * Static Routes
 **************************** */
const express = require("express")
const router = new express.Router()

/* ****************************
 * Home route
 **************************** */
router.get("/", (req, res) => {
  res.render("index", {
    title: "Home"
  })
})

module.exports = router
