/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
// Their stuff
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// My stuff
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute.js");
const accountRoute = require('./routes/accountRoute.js');
const utilities = require("./utilities/index.js");
const pool = require("./database/")

// Init
const app = express();
const env = require("dotenv").config();


/* ***********************
 * Middleware
 * ************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
  })
);
// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ // for parsing application/x-www-form-urlencoded
  extended: true
}));
// Cookie parser
app.use(cookieParser())
// JWT checker
app.use(utilities.checkJWTToken);

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Not at view root

/* ***********************
 * Routes
 *************************/
app.use(static);
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));
// Inventory routes
app.use("/inv", inventoryRoute);
// Account routes
app.use("/account", accountRoute);
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Unfortunately, we don\'t have that page in stock.'})
})

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  let nav
  try {
    nav = await utilities.getNav()
  } catch (error) {
    nav = '<ul><li><a href="/" title="Home page">Home</a></li></ul>'
  }
  
  next({
    status: 404, 
    message: "Unfortunately, we don't have that page in stock.",
    nav: nav
  })
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav
  try {
    nav = await utilities.getNav()
  } catch (error) {
    nav = '<ul><li><a href="/" title="Home page">Home</a></li></ul>'
  }
  
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  
  let message
  if (err.status == 404) { 
    message = err.message 
  } else { 
    message = 'Oh no! There was a crash. Maybe try a different route?' 
  }
  
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav: err.nav || nav // Use nav from error if provided, otherwise get new one
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});


