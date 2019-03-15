const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");
const userAuthenticated = require("../auth/userAuth");

// ROUTE - COMMENTS

router.get("/items/:id/comments/new", userAuthenticated, (req, res) => {
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
router.post("/items/:id/comments", userAuthenticated, (req, res) => {
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

module.exports = router;
