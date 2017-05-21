const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const config = require('./config');

// connect to the database and load models
require('./models').connect(config.dbUri);

const app = express();
// tell the app to look for static files in these directories
app.use(express.static(path.join(__dirname, '../build/')));
app.use(express.static(path.join(__dirname, '../public/')));
app.use('/login', express.static(path.join(__dirname, '../build/')));
app.use('/login', express.static(path.join(__dirname, '../public/')));
app.use('/signup', express.static(path.join(__dirname, '../build/')));
app.use('/signup', express.static(path.join(__dirname, '../public/')));
// tell the app to parse HTTP body messages
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

// load passport strategies
const localSignupStrategy = require('./local-signup');
const localLoginStrategy = require('./local-login');
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

// pass the authenticaion checker middleware
const authCheckMiddleware = require('./auth-check');
app.use('/api', authCheckMiddleware);

// routes
const authRoutes = require('./auth');
const apiRoutes = require('./api');
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000 or http://127.0.0.1:3000');
});