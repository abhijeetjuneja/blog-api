var express = require('express');
var app = express();

//Call cookie parser
var cookieParser = require('cookie-parser');

//Call body parser
var bodyParser = require('body-parser');

//Call mongoose
var mongoose = require('mongoose');

app.use(bodyParser.json({limit:'10mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));

//Database configuration
var dbPath = "mongodb://localhost/blogapp";

//Connect to database
db = mongoose.connect(dbPath);

mongoose.connection.once('open',function(){
	console.log("database connection open");
});

//Include the model
var Blog = require('./blogModel.js');

var bModel = mongoose.model('Blog');
var cModel = mongoose.model('Comment');

//Application level middleware
app.use(function(req,res,next){
	var logs = {'Time of Request': Date.now(),
				'Requested Url'  : req.originalUrl,
				'Base Url'       : req.baseUrl,
				'Ip address'     : req.ip,
				'Method'         :req.method
	};
	console.log(logs);
	next();
});


//Home

app.get('/', function (req, res) {

	res.sendFile('home.html',{ root : 'views'});

});

//Blogs
app.get('/blogs', function (req, res) {

	bModel.find(function(err,result){
		if(err){
			console.log(err);
			sresponse={error:'true',message:err,userMessage:'Some Error occured . Check console',status:500,response:error};
			res.send(sresponse);
		}
		else
		{
			if(result == null || result == undefined || result.length == 0)
			{
				console.log('No Blogs Found');
				console.log(result);
				sresponse={error:'true',userMessage:"No Blogs Found.You haven't created any blog yet",response:result};
				console.log(sresponse);
				res.send(sresponse);
			}
			else
			{
				sresponse={error:null,userMessage:'Success',response:result};
				console.log(sresponse);
				res.send(sresponse);
			}
			
		}
	});

});

//Create a Blog
app.post('/blogs/create', function (req, res) {

	var blog = new bModel({

		title	: req.body.title, 
		subTitle: req.body.subTitle,
		body    : req.body.body

	});

	var date = new Date();
	blog.created = date;

	var tags = (req.body.tags!=undefined && req.body.tags!=null)?req.body.tags.split(','):'';
	blog.tags=tags;

	var authorInfo = {name : req.body.authorName ,email : req.body.authorEmail};
	blog.authorInfo = authorInfo;

	blog.save(function(error){
		if(error){
			console.log(error);
			sresponse={error:'true',message:error,userMessage:'Some Error occured . Check console',status:500,response:error};
			res.send(sresponse);
		}
		else
		{	
			sresponse={error:null,message:"Success",userMessage:'Successfully crreated a Blog',status:200,response:blog};
			res.send(sresponse);
		}
	});

});

//Create a Blog
app.post('/blogs/:id/comment', function (req, res) {

	var comment = new cModel({

		blogId : req.params.id,
		commentText : req.body.commentText,
		userName : req.body.userName


	});

	var date = new Date();
	comment.created = date;

	comment.save(function(error){
		if(error){
			console.log(error);
			sresponse={error:'true',message:error,userMessage:'Some Error occured . Check console',status:500,response:error};
			res.send(sresponse);
		}
		else
		{
			sresponse={error:null,message:'Success',userMessage:'Successfully created a comment',status:500,response:comment};
			res.send(sresponse);
		}
	});

});

//Get a Blog by Id
app.get('/blogs/:id', function (req, res) {

	bModel.findOne({'_id':req.params.id},function(err,result){
		if(err){
			console.log(err);
			sresponse={error:'true',message:err,userMessage:'Some Error occured. Check Id',status:500,response:err};
			res.send(sresponse);
		}
		else if(result == null || result == undefined)
		{
			console.log('Error : Not Found');
			console.log(result);
			sresponse={error:'true',userMessage:'Error : Not Found.Check console',response:result};
			res.send(sresponse);
		}
		else
		{
			this.blog=result;
			var main=this;
			sresponse={error:null,message:'Success',userMessage:'Successfully fetched Blog',status:200,response:result};
			console.log(sresponse);
			cModel.find({'blogId':req.params.id},function(err,result){
				
				if(err){
					console.log(err);
					sresponse={error:'true',message:err,userMessage:'Some Error occured . Check console',status:500,response:err};
					res.send(sresponse);
				}
				else if(result == null || result == '' || result == undefined)
				{
					console.log('No Comments found');
					console.log(result);
					sresponse={error:null,message:'Success',userMessage:'Successfully fetched Blog.No Comments Found.',response:{"blogs":main.blog,"comments":result}};
					console.log(sresponse);
					res.send(sresponse);
				}
				else
				{
					sresponse={error:null,message:'Success',userMessage:'Successfully fetched Blog.Successfully fetched Comments.',status:200,response:{"blogs":main.blog,"comments":result}};
					console.log(sresponse);
					res.send(sresponse);
				}
			});
			
		}
	});

});

//Edit a Blog by Id
app.put('/blogs/:id/edit', function (req, res) {

	var changes = req.body;
	bModel.findOneAndUpdate({'_id':req.params.id},changes,function(err,result){
		if(err){
			console.log(err);
			sresponse={error:'true',message:err,userMessage:'Not found.Check Id',status:500,response:err};
			res.send(sresponse);
		}
		else
		{			
			sresponse={error:null,message:'Success',userMessage:'Successfully updated the blog',status:200,response:result};
			console.log(sresponse);
			res.send(sresponse);
		}
	});
	

});

//Delete a Blog by Id
app.post('/blogs/:id/delete', function (req, res) {

	bModel.remove({'_id':req.params.id},function(err,result){
		if(err){
			console.log(err);
			sresponse={error:'true',message:err,userMessage:'Not found.Check Id',status:500};
			res.send(sresponse);
		}
		else
		{
			cModel.remove({'blogId':req.params.id},function(err,result){
				if(err){
					console.log('No Comments found');
					console.log(result);
					sresponse={error:null,userMessage:'No Comments',response:result};
					console.log(sresponse);
				}
				else
				{
					sresponse={error:null,message:'Success',userMessage:'Successfully deleted Comments',status:200,response:result};
					console.log(sresponse);
				}
			});
			sresponse={error:null,message:'Success',userMessage:'Successfully deleted',status:200,response:result};
			console.log(sresponse);
			res.send(sresponse);
		}
	});

});

//Other routes
app.get('*',function(req,res,next){
	res.status=404;
	next("Path not Found !");
});

//Error handler
app.use(function(err,req,res,next){
	if(res.status==404){
		res.sendFile('error404.html',{ root : 'views'});
	}
	else
	{
		if(res.status==500){
		res.sendFile('error500.html',{ root : 'views'});
		}
		else
		res.send(err);
	}
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});