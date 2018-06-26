//require dependencies
var express = require('express')
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var logger = require("morgan");

//require our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

var methodOverride = require("method-override");
var db = ("../models")

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

//initialize express
var app = express()

// Set up an Express Router
var router = express.Router();

// Require our routes file pass our router object
require("./routes/routes")(router);

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("assets"));

// Have every request go through our router middleware
app.use(router);

// Database configuration with mongoose
// mongoose.connect("mongodb://localhost/mongo-news-scraper");
//define local mongoDB URI
if(process.env.MONGODB_URI){
	//THIS EXECUTES IF THIS IS IN HEROKU
	mongoose.connect(process.env.MONGODB_URI);
}else {
	mongoose.connect("mongodb://localhost/mongo-news-scraper")
}


var db = mongoose.connection;

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});



// Listen on port 3000
app.listen(process.env.PORT || 3000, function() {
  console.log("App running on port 3000!");
});
