var passport = require("passport");

//We need to import Campground and Comment
var Campground = require("../models/campground");
var Comment = require("../models/comment");

//Define an object contatining all the middlewares
var myMiddlewares = {
	
	//isLoggedIn Middleware
	isLoggedIn: function(req, res, next){
		if(req.isAuthenticated()){
			//go to the next step
			return next();
		}
		
		req.flash('error', 'You need to be logged in to do that');
		res.redirect("/login");	
	},
	
	
	//checkCampgroundOwnerAuth Middleware
	checkCampgroundOwnerAuth: function (req, res, next){
		//check if user is logged in
		if(req.isAuthenticated()){
			//find the campground
			Campground.findById(req.params.id, (err, foundCampground) =>{
				if(err){//redirect to previous page if error (undo)
					req.flash('error', 'Sorry Error');
					res.redirect("back");
				}
				else{
					//check if the current connected user own the campground
					//equals is used because object vs String
					if(foundCampground.author.id.equals(req.user._id) || req.user.admin)
						//if evreything ok => go to next middleware out of this function 
						//so the result will be: do what you have to do edit or update
						next();
					else{
						//redirect to previous page if error (undo)
						req.flash('error', "You don't have permission to do that");
						res.redirect("back");
					}
				}
			}); 
		}else{
			//redirect to previous page if error (undo)
			req.flash('error', 'You need to be logged in to do that');
			res.redirect("back");
		}
	},
	
	
	//this middleware check if the user is logged in and if he owns the comment before modifying anything
	checkCommentOwnerAuth: function (req, res, next){
		//check if user is logged in
		if(req.isAuthenticated()){
			//find the comment
			Comment.findById(req.params.comment_id, (err, foundComment) =>{
				if(err)
					//redirect to previous page if error (undo)
					res.redirect("back");
				else{
					//check if the current connected user own the comment
					//equals is used because object vs String
					//we dont to check if req.user exist because we already loggedin (isAuthenticated)
					if(foundComment.author.id.equals(req.user._id) || req.user.admin)
						//if evreything ok => go to next middleware out of this function 
						//so the result will be: do what you have to do edit or update
						next();
					else{
						//redirect to previous page if error (undo)
						req.flash('error', 'Not allowed to do that');
						res.redirect("back");
					}
				}
			}); 
		}else{
			//redirect to previous page if error (undo)
			req.flash('error', 'Please Login first');
			res.redirect("back");
		}
	}
	
	
};

module.exports = myMiddlewares;