/*-----------------------
	My Documentation
-----------------------*/
/* all this packages must be installed before => npm install "package-name" --save */

/*IMPORTANT: we should call the middleware without parenthesis. See here: https://stackoverflow.com/questions/47062571/passport-cannot-read-property-isauthenticated */

var express = require("express");
var router = express.Router();

//we need to require them again
var Campground = require("../models/campground");
var Comment = require("../models/comment");

var myMiddlewares = require('../middleware/index');

// ==============================
// 		COMMENTS ROUTES
// ==============================

// we use /campgrounds/:id before each path because comment dependance on specific campground defined by its id


//NEW: Form to create new Comment 
router.get("/campgrounds/:id/comments/new", myMiddlewares.isLoggedIn,(req, res) => {
		Campground.findById(req.params.id, (err, campground) =>{
			if(err){
				console.log(err);
				req.flash('error', 'Sorry Error');
			}else{
				res.render("comments/new", {camp: campground});
			}
		});
});


//CREATE: Create new Comment and add it to campground
//we add a isLoggedin because we need to add who is the owner of of this comment => he must be logged in
router.post("/campgrounds/:id/comments", myMiddlewares.isLoggedIn, (req, res) => {
		Campground.findById(req.params.id, (err, campground) =>{
			if(err)
				console.log(err);
			else{
				Comment.create(req.body.comment, (err, comment) => {
					if(err){
						console.log(err);
						req.flash('error', 'Sorry Error');
						res.redirect("back");
					}
					else{
						console.log(comment);
						console.log(comment.author);
						//fill the author.id and author.username param form req.user
						comment.author.id = req.user._id;
						comment.author.username = req.user.username;
						comment.save();
						// //push it into campground
						campground.comments.push(comment);
						campground.save();
					}
				});
				req.flash('success', 'Successfully added comment');
				res.redirect("/campgrounds/" + req.params.id);
			}
		});
});

//Edit: Generate the Form to edit a specific Comment 
router.get("/campgrounds/:id/comments/:comment_id/edit", myMiddlewares.checkCommentOwnerAuth, (req, res) => {
		Comment.findById(req.params.comment_id, (err, comment) =>{
			if(err){
				//go back to the previous page
				req.flash('error', 'Sorry Error');
				res.redirect("back");
			}
			else
				res.render("comments/edit", {comment: comment, 
											 camp_id: req.params.id});
		});
});

//Update: Find and Update a specific Comment 
//the put request will be supported because of the method-override look top of app.js
router.put("/campgrounds/:id/comments/:comment_id", myMiddlewares.checkCommentOwnerAuth, (req, res) => {
	
	req.body.comment.content = req.sanitize(req.body.comment.content);
	
	Comment.findOneAndUpdate({_id: req.params.comment_id}, req.body.comment/*this one must be a hole comment not a content , even if the content only is modified */, function (err, newComment) {
			if(err){
				//go back to the previous page
				req.flash('error', 'Sorry Error');
				res.redirect("back");
			}else{
				//console.log(newComment);
				req.flash('success', 'Successfully update comment');
				res.redirect("/campgrounds/" + req.params.id);
			}
				
		});
});

//DELETE: Delete comment then redirect 
//the DELETE request will be supported because of the method-override look top of app.js
router.delete("/campgrounds/:id/comments/:comment_id", myMiddlewares.checkCommentOwnerAuth, (req, res) => {
	Comment.findOneAndRemove({_id: req.params.comment_id}, function (err, deteltedComment) {
		if(err){
			req.flash('error', 'Sorry Error');
			res.redirect("back");
		}
		else{
			req.flash('success', 'Successfully deleted comment');
			res.redirect("/campgrounds/" + req.params.id);
		}
	}); 
});


module.exports = router;