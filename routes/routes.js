//
//scraping tools
var request = require("request");
var cheerio = require("cheerio");
var methodOverride = require("method-override");
// Override with POST having ?_method=DELETE
// app.use(methodOverride("_method"));
var Article = require('../models/Article')
var Note = require('../models/Note')

module.exports = function(router) {

	router.get("/", function(req, res){
		Article.find({
			saved: false
		}, function(err, doc) {
		if (err) {
			res.send(err);
		}

		else{
			res.render("home", {article: doc} );
		}
		});
		// res.render("home")
	})

	// This route renders the saved handledbars page
  router.get("/saved", function(req, res) {
  	// res.json('route hit')
  	 Article.find({saved: true}).populate("notes", 'body').exec(function(err, doc) {
    if (err) {
      res.send(err);
    }
    else {
      res.render("saved", {saved: doc});
    }
  	});
  });

  router.get('/scrape', function(req, res){
  	// First, we grab the body of the html with request
  request("http://www.nytimes.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("#main").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text
  res.redirect("/");
  })

  // put route to updated the article to be saved:true
  router.post("/saved/:id", function(req, res) {
		// res.redirect("/")
	  Article.update({_id: req.params.id}, {$set: {saved: true}}, function(err, doc) {
	    if (err) {
	      res.send(err);
	    }
	    else {
	      res.redirect("/");
	    }
	  });
	});

	//delete route for articles on the saved page
	router.post("/delete/:id", function(req, res){
		 Article.update({_id: req.params.id}, {$set: {saved: false}}, function(err, doc) {
	    if (err) {
	      res.send(err);
	    }
	    else {
	      res.redirect("/saved");
	    }
	  });
	})

	//post route for saving a note to an article
	router.post("/saved/notes/:id", function(req, res) {
	  var newNote = new Note(req.body);
	  console.log("new note" + newNote);
	  newNote.save(function(error, doc) {
	    if (error) {
	      res.send(error);
	    }
	    else {
	      Article.findOneAndUpdate({_id: req.params.id}, { $push: { "notes": doc._id } }, { new: true }).exec(function(err, newdoc) {
	        if (err) {
	          res.send(err);
	        }
	        else {
	          res.redirect("/saved");
	        }
	      });
	    }
	  });
	});

	// delete route to delete a note
	router.post("/saved/delete/:id", function(req, res) {
	  Note.remove({_id: req.params.id}, function(err, doc){
	    if (err) {
	      res.send(err);
	    }
	    else {
	      res.redirect("/saved");
	    }
	  });
	});
}
