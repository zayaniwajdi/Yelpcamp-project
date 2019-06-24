/*-----------------------
	My Documentation
-----------------------*/
/* - 
     Node.js is an open source server environment.
	 Node.js uses JavaScript on the server.
	 Node.js uses asynchronous programming!.
	 see here: https://www.w3schools.com/nodejs/nodejs_intro.asp.
 */

/* - require(...)
	 In order to use Node.js core or NPM modules, you first need to import it using require() function as shown below.   var module = require('module_name'); */

/* - require("express");
     Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. */

//add this line asap
//used to add environnement variables (dotenv package)
require('dotenv').config();

const Port = 3000;
//all this packages must be installed before => npm install "package-name" --save
var express 	= require("express"),
 	mongoose 	= require("mongoose"),
 	app 		= express(),
 	bodyParser 	= require("body-parser"),
	/********* Authentication packages **********/
	//Passport is authentication middleware for Node.js
	//npm install passport passport-local passport-local-mongoose express-session --save
	passport 			  = require("passport"),
	localStrategy 		  = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	session = require("express-session");

/***** required to show message error *******/
var flash = require('connect-flash');

//required to support PUT and DELETE method
var methodOverride = require("method-override");

//Import seedDB file (test file to remove and add data into database)
var seedDB = require("./seeds");


//Import models
var	Campground = require("./models/campground"),
	Comment = require("./models/comment"),
	User = require("./models/user");

//Import Routes
var campgroundsRoutes = require("./routes/campgrounds"),
 commentsRoutes = require("./routes/comments"),
 authRoutes = require("./routes/auth");

//required to check if content contains bad script
var expressSanitizer = require("express-sanitizer");


//Needed to use the body-parser 
app.use(bodyParser.urlencoded({extended: true}));
//specifie the path we use for personel css file
app.use(express.static(__dirname + '/public'));
//We are telliNg to nodejs we are working with files with extension ejs (EMBEDDED JAVA SCRIPT) (files where we can use <% %> and <%= %> ... )
app.set("view engine", "ejs");

// using method-override will support the PUT amd the DELETE request when it founds the word  _method (it can be any word)
app.use(methodOverride("_method"));


app.use(flash());

app.use(expressSanitizer());
/***************************
 	Authentication Setup
 ***************************/
app.use(session({
	//secret will be used to encod and decode session so this is can be anything
	//in real world it is a random number
	secret: "bla bla bla",
	resave: false,
	saveUninitialized: false,
	cookie: { maxAge: 60000 }
}));

//passport.initialize() middleware is required to initialize Passport.
app.use(passport.initialize());
//If your application uses persistent login sessions, passport.session() middleware must also be used
app.use(passport.session());

//we tell to passport you have to use the strateg defined into User.authenticate() 
//defined by passportLocalMongoose
//a strategy is the manner defined to verfiy username and password
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



/***************************
 	CREATE GLABAL VARIABLES
 ***************************/
//rather than adding a variable currentUser everytime we render a template
//we can add a middlware that will be executed every time and add a new local variable inside res.locals 
//so every template now has the content of these variables
//it must be at this place
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.info = req.flash('info');
	res.locals.error = req.flash('error') || req.flash('failureFlash');
	res.locals.success = req.flash('success') || req.flash('successFlash');
	res.locals.moment = require('moment');
	next();
});





// To avoid this kind of warning
// DeprecationWarning: Mongoose: `findOneAndUpdate()` and `findOneAndDelete()` without the `useFindAndModify` option set to false are deprecated. See: https://mongoosejs.com/docs/deprecations.html#-findandmodify-
// DeprecationWarning: collection.findAndModify is deprecated. Use findOneAndUpdate, findOneAndReplace or findOneAndDelete instead.
mongoose.set('useFindAndModify', false);


//we use this function defined inside teh seed.ejs file to remove, create campgrounds with some comments (it is just for test) 
seedDB();


/************************************************
 	Connect to mongoDB Database with mongoose
	- create schema
	- convert to model
	- create and save collection to DB
*************************************************/
mongoose.connect('mongodb://localhost:27017/yelpcampDB', {useNewUrlParser: true});
mongoose.set('useCreateIndex', true);

/**************
 	Routes
***************/
//we seperate all the routes into files under routes folder
// ==============================
// 		CAMPGROUNDS ROUTES
// ==============================

//now we can remove the prefix "/campgrounds" from the route inside the exported file 
//it will be appended here
app.use( campgroundsRoutes);

// ==============================
// 		COMMENTS ROUTES
// ==============================

app.use(commentsRoutes);

// ==============================
// 		AUTHENTICATION ROUTES
// ==============================

app.use(authRoutes);

/*************************
 	start YelpCamp app
**************************/
app.listen(Port, () => {
	 console.log(`YelpCamp has started : listening on port ${Port}!`);
});