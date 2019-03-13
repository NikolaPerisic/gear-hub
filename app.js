const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Comment = require("./models/comment");
const Item = require("./models/item");
const preloadDB = require("./preloadDB");
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
preloadDB();

//ROUTES - HOME
app.get("/", function(req, res) {
    res.render("landing");
});

//// ROUTE - INDEX
app.get("/items", (req, res) => {
    // query db
    Item.find({}, (err, allItems) => {
        if (err) {
            console.log(err);
        } else {
            res.render("items/index", { items: allItems });
        }
    });
});

// ROUTE - CREATE - add new item
app.post("/items", (req, res) => {
    //get data from form and add to items arr
    let name = req.body.name;
    let image = req.body.image;
    let review = req.body.review;
    //create new item and save it to the db
    let newItem = { name: name, image: image, review: review };
    Item.create(newItem, (err, newEntry) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/items");
        }
    });
});

// ROUTE - NEW - show form
app.get("/items/new", (req, res) => {
    res.render("items/new");
});

// ROUTE - SHOW - shows info about item
app.get("/items/:id", (req, res) => {
    //find by ID
    Item.findById(req.params.id)
        .populate("comments")
        .exec((err, foundItem) => {
            if (err) {
                console.log(err);
            } else {
                res.render("items/show", { item: foundItem });
            }
        });
});

// ROUTE - COMMENTS

app.get("/items/:id/comments/new", (req, res) => {
    //find by ID
    Item.findById(req.params.id, (err, item) => {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { item: item });
        }
    });
});

// COMMENTS POST ROUTE
app.post("/items/:id/comments", (req, res) => {
    //find by ID
    Item.findById(req.params.id, (err, item) => {
        if (err) {
            console.log(err);
            res.redirect("/items");
        } else {
            // create new comment
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    console.log(err);
                } else {
                    //connect comment to item
                    item.comments.push(comment);
                    item.save();
                    //redirect to show items page
                    res.redirect("/items/" + item._id);
                }
            });
        }
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`App running on ${PORT}`);
});
