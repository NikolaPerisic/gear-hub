const express = require("express");
const router = express.Router();
const Item = require("../models/item");
const userAuthenticated = require("../auth/userAuth");

//ROUTES - HOME
router.get("/", function(req, res) {
    res.render("landing");
});

//// ROUTE - INDEX
router.get("/items", (req, res) => {
    // query db
    Item.find({}, (err, allItems) => {
        if (err) {
            console.log(err);
        } else {
            res.render("items", { items: allItems });
        }
    });
});

// ROUTE - CREATE - add new item
router.post("/items", userAuthenticated, (req, res) => {
    //get data from form and add to items arr
    const { name, image, review } = req.body;
    //create new item and save it to the db
    let newItem = {
        name,
        image,
        review
    };
    Item.create(newItem, (err, newEntry) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/items");
        }
    });
});

// ROUTE - NEW - show form
router.get("/items/new", userAuthenticated, (req, res) => {
    res.render("items/new");
});

// ROUTE - SHOW - shows info about item
router.get("/items/:id", (req, res) => {
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

module.exports = router;
