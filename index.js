const express = require("express")
const session = require("express-session")
const flash = require("connect-flash")
require("dotenv").config()

const app = express()

/* ****************************
 * Middleware
 **************************** */
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

/* ****************************
 * Session Middleware
 **************************** */
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
)

/* ****************************
 * Flash Middleware
 **************************** */
app.use(flash())

/* ****************************
 * Global Variables for Views
 **************************** */
app.use((req, res, next) => {
  res.locals.success = req.flash("success")
  res.locals.notice = req.flash("notice")
  res.locals.error = req.flash("error")
  next()
})

/* ****************************
 * View Engine
 **************************** */
app.set("view engine", "ejs")
app.set("views", "./views")

/* ****************************
 * Routes
 **************************** */
app.use("/", require("./routes/static"))
app.use("/inventory", require("./routes/inventoryRoutes"))

/* ****************************
 * Server
 **************************** */
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`CSE Motors running on http://localhost:${port}`)
})
