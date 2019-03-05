const mongoose   = require("mongoose"),
      Campground = require("./models/campground"),
      Comment    = require("./models/comment");

let seeds = [
    {
        name: "Campground 1",
        image: "https://images.unsplash.com/photo-1540133002245-aa523db8a113?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=667&q=80",
        description: "This is awesome!"
    },
    {
        name: "Campground 2",
        image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=667&q=80",
        description: "This is awesome!"   
    },
    {
        name: "Campground 3",
        image: "https://images.unsplash.com/photo-1534187886935-1e1236e856c3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=335&q=80",
        description: "This is awesome!"    
    }
];

async function seedDB() {
    try {
        await Campground.remove({});
        await Comment.remove({});
        
        for(const seed of seeds){
            let campground = await Campground.create(seed);
            let comment = await Comment.create(
                {
                text: "This place is so cool!",
                author: "Jon Snow"
                }
            );
            campground.comments.push(comment._id);
            campground.save();
        }
    } catch(err) {
        console.log(err);
    }
}

module.exports = seedDB;