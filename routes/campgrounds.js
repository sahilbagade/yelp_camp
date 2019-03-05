const express    = require("express"),
      router     = express.Router(),
      Campground = require("../models/campground"),
      Comment    = require("../models/comment"),
      middleware = require("../middleware");
      
let { isLoggedIn, checkUserCampground, checkUserComment, isAdmin } = middleware; // destructuring assignment

// Define escapeRegex function for search feature
function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

//INDEX Route - show all campgrounds
router.get("/", (req, res) => {
  if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all campgrounds from DB
      Campground.find({name: regex}, (err, searchResults) => {
        if(err){
            console.log(err);
        } else {
            if(searchResults.length === 0) {
            req.flash("error", "No Campgrounds found!");
            return res.redirect("/campgrounds");
            }
             res.render("campgrounds/index", { campgrounds: searchResults });
            }
        });
    } else {
      // Get all campgrounds from DB
      Campground.find({}, (err, searchResults) => {
         if(err){
             console.log(err);
        } else {
              res.render("campgrounds/index",{ campgrounds: searchResults });
            }
        });
    }
});

//CREATE - add new campground to DB
router.post("/", isLoggedIn, (req, res) => {
  // get data from form and add to campgrounds array
  let name   = req.body.name,
      image  = req.body.image,
      desc   = req.body.description,
      author = {
      id: req.user._id,
      username: req.user.username
  };
  let cost = req.body.cost;
  let newCampground = {name: name, image: image, description: desc, cost: cost, author:author};
  // Create a new campground and save to DB
    Campground.create(newCampground, (err, newlyCreated) => {
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });

//NEW Route - show form to create new campground
router.get("/new", isLoggedIn, (req, res) => {
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", (req, res) => {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if(err || !foundCampground){
            console.log(err);
            req.flash('error', 'Sorry, that campground does not exist!');
            return res.redirect('/campgrounds');
        }
        console.log(foundCampground);
        //render show template with that campground
        res.render("campgrounds/show", {campground: foundCampground});
    });
});

//EDIT Campground Route
router.get("/:id/edit", isLoggedIn, checkUserCampground, (req, res) =>{
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err){
            req.flash("error", "Yikes! Something went wrong.");
            res.redirect("/campgrounds");
        }
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});


//UPDATE Campground Route
router.put("/:id", (req, res) => {
  let newData = {name: req.body.name, image: req.body.image, description: req.body.description, cost: req.body.cost};
    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, (err, campground) => {
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });

//DESTROY Campground Route
router.delete("/:id", isLoggedIn, checkUserCampground, (req, res) => {
    Comment.remove({
      _id: {
        $in: req.campground.comments
      }
    }, (err) => {
        if(err) {
          req.flash('error', err.message);
          res.redirect('/');
        } else {
          req.campground.remove((err) => {
            if(err) {
                req.flash('error', err.message);
                return res.redirect('/');
            }
            req.flash('error', 'Campground deleted!');
            res.redirect('/campgrounds');
          });
        }
    });
});

module.exports = router;