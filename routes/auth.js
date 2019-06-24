/*-----------------------
	My Documentation
-----------------------*/
/* all this packages must be installed before => npm install "package-name" --save */

var express = require("express");
var router = express.Router();

//we need to require them again
var passport = require("passport");
var User = require("../models/user");

/* we need this three package for sending e-mail */
var async = require("async");
var nodemailer = require("nodemailer");
/* we need crypto for encryption / crypto is built-in node.js we don't need to install a new package */
var crypto = require("crypto");



// ==============================
// 		AUTHENTICATION ROUTES
// ==============================


//Signup or Register Routes
router.get("/signup", (req, res) => {
	req.flash('info', 'Sign up');
	res.render("authentication/signup");
});

router.post("/signup", (req, res) => {
	//user.register will save the username and password crypted inside database
	
	/* We keep creating the user in this way not adding the hole object from the form because we nedd  to pass
	    the password alone to be encrypted*/
	let newUser = new User({fname: req.body.fname,
							lname: req.body.lname,
							admin: req.body.adminPassword === process.env.ADMIN_PWD?true:false,
							//IMPORTANT: because of strategy local you must:
							//- use input with variable name username and password
							//- the username must be one string
							//see https://www.npmjs.com/package/passport-local-mongoose
							//see http://www.passportjs.org/docs/username-password/
							username: req.body.username,
							email: req.body.username,
							gender: req.body.gender,
							City: req.body.city	
							});
	User.register(newUser,
				//this password will be encrypted and saved into the db
				req.body.password, (err, user) => {
				if(err){
					req.flash('error', err.message);
					return res.redirect("back");
				}
				console.log("hi");
				//if no error login this user and redirect whereever you want
				//local is the strategie so we can use facebook or twitter 
				passport.authenticate("local")(req, res, () => {
					req.flash('success', 'Sign up');
					res.redirect("/campgrounds");	
				});
			});	
});




//Login Routes
router.get("/login", (req, res) => {
	req.flash('info', 'Login');
	res.render("authentication/login");
});

	//will check username/password given inside the form with ones inside DB
    //we don't have to say this is username and apssword explicitly, the middleware does that for us
router.post('/login', 
  passport.authenticate('local', {successRedirect: '/campgrounds', 
								  failureRedirect: '/login' ,
								  successFlash: 'Welcome!',
								  failureFlash: 'Username or Password incorrect !!!'}), 
			function(req, res) {
    //this callback does not do anything
  });


//Logout Route
router.get("/logout", (req, res) => {
	//destroy all user data in the current session
	req.logout();
	req.flash('info', 'You logout');
	res.redirect("/campgrounds");
});


// ======================================
// 		FORGOT/RESET PASSWORD ROUTES
// ======================================


//GET FORGOT: password view (dipslay the form)
router.get('/forgot', /* this is the middleware */function(req, res) {
  res.render('authentication/forgot');
});


//POST FORGOT: treatment after submit reset password -> send email to reset password
router.post('/forgot', function(req, res, next) {
	console.log(req.headers.host);
  /* this a function that execute an array of function one after another */
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
		  //the token created will be sent inside the url sent to user inside the email and this one expires after an hour
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
		//save modification into database
        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
		  host: "smtp.gmail.com",
		  port: 587,
		  secure: false, // upgrade later with STARTTLS
		  auth: {
			user: 'zayaniwajdi@gmail.com',
          	pass: process.env.MY_GMAIL_PWD
		  }
		});
		
      var mailOptions = {
        to: user.email,
        from: 'zayaniwajdi@gmail.com',
        subject: 'Node.js TEST Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          //req.headers.host contain the address of the web site (in our case it's https://goormide-wajdi-qqfkf.run.goorm.io)
		  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], /* this is the callback */function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});



//RESET FORM: form to fill new password
router.get('/reset/:token', function(req, res) {
	//find the user with the same resetPasswordToken received inside the request + check if the token is expired
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
	//render reset form 
    res.render('authentication/reset', {token: req.params.token});
  });
});



//POST RESET FORM
router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
		//find the user with the same resetPasswordToken received inside the request + check if the token is expired
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
		//update password + reset token and expires to undefined
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

		//save modification
        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    },
	  
	 
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
		  host: "smtp.gmail.com",
		  port: 587,
		  secure: false, // upgrade later with STARTTLS
		  auth: {
			user: 'zayaniwajdi@gmail.com',
          	pass: process.env.MY_GMAIL_PWD
		  }
		});
      var mailOptions = {
        to: user.email,
        from: 'zayaniwajdi@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/campgrounds');
  });
});




module.exports = router;
