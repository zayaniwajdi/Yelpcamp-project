/*-----------------------
	My Documentation
-----------------------*/
/* all this packages must be installed before => npm install "package-name" --save */

/*IMPORTANT: we should call the middleware without parenthesis. See here: https://stackoverflow.com/questions/47062571/passport-cannot-read-property-isauthenticated */

//This line must be called asap (google Geocoder)
var NodeGeocoder = require('node-geocoder');

var express = require("express");
var router = express.Router();

//we need to require them again
var Campground = require("../models/campground");
var Comment= require("../models/comment");

//usually we require all the path file like: require('../middleware/index'); But if the file is index.js we can just use the name of the file and node will look for index.js 
var myMiddlewares = require('../middleware');


/************ GOOGLE MAPGEOCODER CONFIG *************/ 
var options = {
  provider: 'google',
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: process.env.GEOCODER_MYAPI_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);


// ==============================
// 		CAMPGROUNDS ROUTES
// ==============================

router.get("/", (req, res) => {
	res.render("landing");
});

//INDEX:  display all campgrounds
//prefix "/campgrounds" will appended to this  route
router.get("/campgrounds", (req, res) => {
	//handling the query search from input search
	if(req.query.search){
		//this search function comes from mongoose-regex-search npm package
		Campground.search(req.query.search, (error, results) => {
		if(error)
			console.log(error);
		else
			res.render("campgrounds/index", {campgrounds: results});
		});
	}else{
		Campground.find({}, function(error, campgrounds){
			if(error)
				console.log(error);
			else{
				res.render("campgrounds/index", {campgrounds: campgrounds});
			}
		});
	}
});


//NEW: Form to create new camground
//IMPORTANT: we should call the middleware without parenthesis. See here: https://stackoverflow.com/questions/47062571/passport-cannot-read-property-isauthenticated

router.get("/campgrounds/new", myMiddlewares.isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

//CREATE: Add new campground to DB
router.post("/campgrounds", myMiddlewares.isLoggedIn, (req, res) => {
		
	Campground.create(req.body.camp, function (err, newCampground){
		if (err) 
			console.log("error while creating and saving campground");
		else{
				newCampground.author.id = req.user._id;
				newCampground.author.username = req.user.username;
				newCampground.save();

				geocoder.geocode(req.body.camp.address, function(err, res) {
					if(err)
						 console.log(err);
					else{
						console.log(res[0].formattedAddress);
						newCampground.address_details.formattedAddress = res[0].formattedAddress;
						newCampground.address_details.latitude = res[0].latitude;
						newCampground.address_details.longitude = res[0].longitude;
						newCampground.save();										
					}
				});

			//redirect to the cretaed new campground
			req.flash('success', 'Successfully added campground');
			res.redirect("/campgrounds/" + newCampground._id);

		}

	});
});

//SHOW: show campground on details
router.get("/campgrounds/:id", (req, res) => {
	
	//console.log(req.params.id);
	//we need to populate the found campground to use it within the show view (that will replace comment id by the content and author)
	Campground.findById(req.params.id).populate("comments").exec((err, populatedCamp) =>{
		if(err)
			console.log(err);
		else{
			console.log("currentUser : " + req.user);
			res.render("campgrounds/show", {camp: populatedCamp});
		}
	}); 
});



/* EDIT page: Redirect to Edit page of a specific campground
the checkCampgroundOwnerAuth is executed before passing to callback */
	//IMPORTANT: we should call the middleware without parenthesis. See here: https://stackoverflow.com/questions/47062571/passport-cannot-read-property-isauthenticated
router.get("/campgrounds/:id/edit", myMiddlewares.checkCampgroundOwnerAuth, (req, res) => {
	//Find the specific campground by id and display its information inside the form to be updated
	Campground.findById(req.params.id, (err, campground) =>{		
		if(err)
			req.flash('error', 'Sorry Error');
		else
			res.render("campgrounds/edit", {camp: campground});
	}); 
});


//UPDATE: Update camp then redirect 
//the PUT request will be supported because of the method-override look top of app.js
router.put("/campgrounds/:id", myMiddlewares.checkCampgroundOwnerAuth, (req, res) => {
	//check if body contain script code and remove it just keep html code (require express-sanitizer paquage to install)
	req.body.camp.description = req.sanitize(req.body.camp.description);
	
	//req.body.camp is one object created inside the campground view 
	//rather than  req.body.name  => req.body.camp[name]
	//			   req.body.url  => req.body.camp[url]
	//			   req.body.description  => req.body.camp[description]
	// ==> at the end we use req.body.camp object 
	Campground.findOneAndUpdate({_id: req.params.id}, req.body.camp, function (error, camp) {
		if(error)
			res.redirect("/campgrounds");
		else{
			req.flash('success', 'Successfully updated');
			res.redirect("/campgrounds/" + req.params.id);
		}
	}); 
});


//DELETE: Delete camp then redirect 
//the DELETE request will be supported because of the method-override look top of app.js
router.delete("/campgrounds/:id", myMiddlewares.checkCampgroundOwnerAuth, (req, res) => {
	Campground.findOneAndRemove({_id: req.params.id}, function (error, deteltedCamp) {
		console.log(deteltedCamp);
		if(error)
			res.redirect("/campgrounds");
		else{
			//Delete all the comments associated tothis campground inside the Comments document
			//console.log(deteltedCamp.comments);
			
			req.flash('success', 'Successfully deleted comment');
			deteltedCamp.comments.forEach(function(commentID){
				Comment.findOneAndRemove({ _id: commentID }, (err, deletedComment) => {
							console.log(deletedComment);			  
				});
			});
			res.redirect("/campgrounds");
		}
	}); 
});


module.exports = router;