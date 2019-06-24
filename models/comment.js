var mongoose 	= require("mongoose");

// Comment Schema
var commentSchema = new mongoose.Schema({
	content: String,
	//associate the comment to the connected user who did it
	author: {
		id: {
				type: mongoose.Schema.Types.ObjectId,
         		ref: "User"
			},
		username: String
	},
	created: { type: Date, default: Date.now }
});

// Convert the schema to a model (the collection name will be Comments inside the DB )
var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;