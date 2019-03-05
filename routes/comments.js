const express    = require("express"),
      router     = express.Router({mergeParams: true}),
      Campground = require("../models/campground"),
      Comment    = require("../models/comment"),
      middleware = require("../middleware");

let {isLoggedIn, checkUserComment, isAdmin} = middleware;

//Comments New
router.get("/new", isLoggedIn, (req, res) => {
    //find campground by ID
    Campground.findById(req.params.id, (err, campground) => {
       if(err){
           req.flash("error", "Something went wrong. Please try again. ");
           return res.redirect("back");
       } else {
           res.render("comments/new", {campground: campground});
       }
    });
});

//Comments Create
router.post("/", isLoggedIn, (req, res) => {
   //look campground using ID
   Campground.findById(req.params.id, (err, campground) => {
      if(err){
          req.flash("error", "Something went wrong!");
          res.redirect("/campgrounds");
        } else {
          Comment.create(req.body.comment, (err, comment) => {
             if(err){
                 req.flash("error", "Something went wrong!");
                 console.log(err);
            } else {
                //add username & id to comment
                comment.author.id = req.user._id;
                comment.author.username = req.user.username;
                //save comment
                comment.save();
                campground.comments.push(comment);
                campground.save();
                req.flash("success", "Successfully added your comment!");
                res.redirect("/campgrounds/" + campground._id);
              }
            });
        }
    });
});

//Comment Edit Route
router.get("/:comment_id/edit", isLoggedIn, checkUserComment, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err || !foundCampground){
            req.flash("error", "No campground to comment!");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, (err, foundComment) => {
           if(err){
               req.flash("error", "Sorry. Editing comment is unavailable.");
               return res.redirect("back");
           }
           res.render("comments/edit", { campground_id: req.params.id, comment: foundComment });
        });
    });
});

//Comment Update Route
router.put("/:comment_id", isLoggedIn, checkUserComment, (req, res) => {
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
      if(err){
          req.flash("error", "Oops. Comment update failed!");
          return res.redirect("back");
        }
          req.flash("success", "Comment successfully updated!");
          res.redirect("/campgrounds/" + req.params.id);
   });
});

//Comment Destroy Route
router.delete("/:comment_id", isLoggedIn, checkUserComment, (req, res) => {
  // find campground, remove comment from comments array, delete comment in db
  Comment.findByIdAndRemove(req.params.comment_id, (err) => {
    if(err){ 
        req.flash("error", "Couldn't delete your comment!");
        return res.redirect("back");
    }
        req.flash("success", "Comment deleted!");
        res.redirect("/campgrounds/" + req.params.id);
    });
});

module.exports = router;