var mongoose 	= require("mongoose");
passportLocalMongoose = require("passport-local-mongoose");

// Comment Schema
var userSchema = new mongoose.Schema({
	fname: String,
	lname: String,
	username: String,
	admin: {type: Boolean, default: false},
	email: String,
	gender: String,
	City: String,
	password: String,
	resetPasswordToken: String,
	resetPasswordExpires: Date
});

//extend user model to use all passportLocalMongoose features. so we plugin  passportLocalMongoose to userSchema
userSchema.plugin(passportLocalMongoose);

// Convert the schema to a model (the collection name will be Users inside the DB )
var User = mongoose.model("User", userSchema);

module.exports = User;