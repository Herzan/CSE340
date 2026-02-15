/* ******************************************
 * server.js
 * Primary application controller
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const jwt = require("jsonwebtoken");
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
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // true if using HTTPS
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
 * Navigation & Auth Middleware
 * ⚡ Optimized to prevent multiple queries
 *************************/
app.use(async (req, res, next) => {
  try {
    // Cache nav per request to avoid repeated classification queries
    if (!res.locals.nav) {
      res.locals.nav = await utilities.getNav(req);
    }
  } catch {
    res.locals.nav = '<ul><li><a href="/">Home</a></li></ul>';
  }

  // JWT + logged-in handling
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      res.locals.accountData = decoded;
    } catch {
      res.locals.accountData = null;
    }
  } else {
    res.locals.accountData = null;
  }

  res.locals.loggedin = !!res.locals.accountData;

  next();
});

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
app.use((req, res, next) => {
  // If nav is already set in middleware, reuse it
  const nav = res.locals.nav || '<ul><li><a href="/">Home</a></li></ul>';
  const err = new Error("Sorry, the page you requested could not be found.");
  err.status = 404;
  err.nav = nav;
  next(err);
});

/* ***********************
 * Global Error Handler
 *************************/
app.use((err, req, res, next) => {
  const nav = res.locals.nav || '<ul><li><a href="/">Home</a></li></ul>';

  console.error('Global Error:', err.message, err.stack);

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
