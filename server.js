/* ******************************************
 * server.js
 * Primary application controller
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
// Core & third-party
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const dotenv = require("dotenv").config();

// Database & session store
const pgSession = require("connect-pg-simple")(session);
const pool = require("./database/");

// Routes & controllers
const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const baseController = require("./controllers/baseController");

// Utilities
const utilities = require("./utilities");

// App init
const app = express();

/* ***********************
 * Trust proxy (RENDER)
 *************************/
app.set("trust proxy", 1);

/* ***********************
 * Session Middleware
 *************************/
app.use(
  session({
    store: new pgSession({
      pool,
      createTableIfMissing: true,
    }),
    name: "cse340.sid",
  secret: "mySuperSecret123!", // ⚡ REQUIRED
  resave: false,               // don't save session if unmodified
  saveUninitialized: true,     // save uninitialized sessions
  cookie: { secure: false }    // true if using HTTPS
  })
);

/* ***********************
 * Flash Messages
 *************************/
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

/* ***********************
 * Body & Cookie Parsers
 *************************/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

/* ***********************
 * JWT Middleware
 *************************/
app.use(utilities.checkJWTToken);

/* ***********************
 * View Engine
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
// Static files
app.use(staticRoutes);

// Home
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory
app.use("/inv", inventoryRoute);

// Account
app.use("/account", accountRoute);

/* ***********************
 * 404 Handler (LAST ROUTE)
 *************************/
app.use(async (req, res, next) => {
  let nav;
  try {
    nav = await utilities.getNav();
  } catch {
    nav = '<ul><li><a href="/">Home</a></li></ul>';
  }

  next({
    status: 404,
    message: "Unfortunately, we don't have that page in stock.",
    nav,
  });
});

/* ***********************
 * Global Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav;
  try {
    nav = await utilities.getNav();
  } catch {
    nav = '<ul><li><a href="/">Home</a></li></ul>';
  }

  console.error(`Error at "${req.originalUrl}": ${err.message}`);

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message:
      err.status === 404
        ? err.message
        : "Oh no! There was a crash. Please try again later.",
    nav: err.nav || nav,
  });
});

/* ***********************
 * Server Info
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

/* ***********************
 * Start Server
 *************************/
app.listen(port, () => {
  console.log(`🚀 App running on ${host}:${port}`);
});
