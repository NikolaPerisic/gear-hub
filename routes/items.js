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
    const author = {
        id: req.user._id,
        username: req.user.name
    };
    //create new item and save it to the db
    let newItem = {
        name,
        image,
        review,
        author
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
// ROUTE - EDIT
router.get("/items/:id/edit", userAuthenticated, (req, res) => {
    Item.findById(req.params.id, (err, foundItem) => {
        if (err) {
            res.redirect("/items");
        } else {
            res.render("items/edit", { item: foundItem });
        }
    });
});
// ROUTE - UPDATE
router.put("/items/:id", userAuthenticated, (req, res) => {
    const newItem = {
        name: req.body.name,
        image: req.body.image,
        review: req.body.review
    };
    Item.findByIdAndUpdate(req.params.id, newItem, (err, updated) => {
        if (err) {
            res.redirect("/items");
        } else {
            res.redirect("/items/" + req.params.id);
        }
    });
});

// ROUTE - DELETE
router.delete("/items/:id", userAuthenticated, (req, res) => {
    Item.findByIdAndDelete(req.params.id, err => {
        if (err) {
            console.log(err);
        }
        res.redirect("/items");
    });
});
module.exports = router;
