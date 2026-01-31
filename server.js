/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const env = require('dotenv').config()
const app = express()
const session = require('express-session')
const pool = require('./database/')
const utilities = require('./utilities/')
const baseController = require('./controllers/baseController')
const static = require('./routes/static')
const inventoryRoute = require('./routes/inventoryRoute')
const accountRoute = require('./routes/accountRoute')
const reviewRoute = require('./routes/reviewRoute')
const errorRoute = require('./routes/errorRoute')
const bodyParser = require('body-parser')
const cookieParser = require("cookie-parser")

/* ***********************
 * Middleware
 * ************************/
app.use(
    session({
        store: new (require('connect-pg-simple')(session))({
            createTableIfMissing: true,
            pool,
        }),
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        name: 'sessionId',
    })
)

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res)
    next()
})

app.use(bodyParser.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(utilities.checkJWTToken)

/* ***********************
 * View Engine and Templates
 *************************/
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.set('layout', './layouts/layout') // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static)
// Index route
app.get('/', utilities.handleErrors(baseController.buildHome))
// Inventory routes
app.use('/inv', utilities.handleErrors(inventoryRoute))
// Account routes
app.use('/account', utilities.handleErrors(accountRoute))
// Review routes
app.use('/review', utilities.handleErrors(reviewRoute))
// Error routes
app.use('/error', utilities.handleErrors(errorRoute))

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
    const heading = 'You seem to have lost a few parts?'
    const quote = `Sorry, we couldn't find the page you're looking for :-( <br> But you could try any of the pages in the menu-bar.`
    next({ status: 404, message: utilities.buildErrorMessage(heading, quote) })
})
/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
    let nav = await utilities.getNav()
    let title
    let message
    console.error(`Error at: "${req.originalUrl}": ${err.status || 500}`)
    if (err.status === 404) {
        title = `${err.status} - PAGE NOT FOUND`
        message = err.message
    } else {
        title = `500 - INTERNAL SERVER ERROR`
        const heading = 'Oh no! There was a crash!'
        const quote = ` Maybe try watching where you are going next time?`
        message = utilities.buildErrorMessage(heading, quote)
    }
    res.render('errors/error', {
        title,
        message,
        nav,
    })
})
/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
    console.log(`app listening on ${host}:${port}`)
})
