var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var data = [
	{
		name: "campground 1",
		url: "https://farm1.staticflickr.com/130/321487195_ff34bde2f5.jpg",
		description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	},
	{
		name: "campground 2",
		url: "https://farm7.staticflickr.com/6014/6015893151_044a2af184.jpg",
		description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	},
	{
		name: "campground 3",
		url: "https://farm8.staticflickr.com/7252/7626464792_3e68c2a6a5.jpg",
		description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	}
];


async function seedDB(){
	//await execute the function until it finish then pass to next one
	//NB: the await must be inside an async function
	
	//remove all campgrounds 	
	await Campground.deleteMany({}, (err, result) => {
		console.log("all campgrounds deleted ");
	});
	
	//remove all comments 
	await Comment.deleteMany({}, (err, result) => {
		console.log("all comment deleted ");
	});
	
	
	
		
	//add a few campgrounds
	// for(const camp of data){
	// 	Campground.create(camp, (err, campground) => {
	// 	  if (err) 
	// 		  console.log("error while creating and saving Campground");
	// 	  else{
	// 		  console.log("   + Campground added ");

	// 		  //add a few comments
	// 		  Comment.create({ author: 'wajdi', content: 'comment'}, (err, comment) => {
	// 			  if(err)
	// 				  console.log(err);
	// 			  else{
	// 					console.log("   	+ Comment added ");
	// 				  campground.comments.push(comment);
	// 				  campground.save();
	// 			  } 
	// 		  });
	// 	  }
	// 	});
	// }
		
			
	

}

module.exports = seedDB;