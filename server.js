/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
require("dotenv").config()
const app = express()

/* ***********************
 * View Engine and Views Folder
 *************************/
app.set("view engine", "ejs")
app.set("views", "./views")

/* ***********************
 * Middleware
 *************************/
app.use(express.static("public"))

/* ***********************
 * Routes
 *************************/
const staticRoutes = require("./routes/static")
app.use("/", staticRoutes)

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || "localhost"

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on http://${host}:${port}`)
})
