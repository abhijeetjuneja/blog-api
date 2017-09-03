//Include the module
var mongoose=require('mongoose');


//Declare the schema instance
var Schema=mongoose.Schema;

//Declare the schema
var blogSchema = new Schema({

	title		: {type:String,default:'',required:true},
	subTitle	: {type:String,default:''},
	body		: {type:String,default:''},
	authorInfo	: {},
	tags		: [],
	created		: {type:Date},
	modified	: {type:Date}

});


var commentSchema = new Schema({

	blogId		: {type:String,default:''},
	commentText	: {type:String,default:''},
	created		: {type:Date},
	userName    : {type:String,default:'',required:true}
	
	  
});

mongoose.model('Comment',commentSchema);
mongoose.model('Blog',blogSchema);