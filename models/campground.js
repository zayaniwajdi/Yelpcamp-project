/*-----------------------
	My Documentation
-----------------------*/
/* - module.exports = Object;
	 Export this Object to be accessable anywhere inside the node Js project (make it in the global scope).
	 In order to use this Object, it must be imported using require(...)
	 
*/
var mongoose 	= require("mongoose");

const searchable = require('mongoose-regex-search');

// Campground Schema
var campgroundSchema = new mongoose.Schema({
	name: {type: String, searchable: true},
	price: String,
	url: String,
	address_details: {
		formattedAddress: String,
		latitude: Number,
		longitude: Number
	},
	description: String,
	created: { type: Date, default: Date.now },
	//associate the campground to the connected user who did it
	author: {
		// id = _id of user (simple)
		id: {
				type: mongoose.Schema.Types.ObjectId,
         		ref: "User"
			},
		username: String
	},
	//this attribute should be an array of comment id
	comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

//plugin all fonction from mongoose-regex-search to campgroundSchema
//so now any model type campgroundSchema can use all this function
campgroundSchema.plugin(searchable);

// Convert the schema to a model (the collection name will be Campgrounds inside the DB )
var Campground = mongoose.model("Campground", campgroundSchema);


module.exports = Campground;