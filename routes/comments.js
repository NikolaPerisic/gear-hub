const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");
const userAuthenticated = require("../auth/userAuth");
const Item = require("../models/item");

// ROUTE - COMMENTS

router.get("/items/:id/comments/new", userAuthenticated, (req, res) => {
    //find by ID
    Item.findById(req.params.id)
        .then(item => {
            res.render("comments/new", { item: item });
        })
        .catch(err => console.log(err));
});

// COMMENTS POST ROUTE
router.post("/items/:id/comments", userAuthenticated, (req, res) => {
    //find by id
    Item.findById(req.params.id)
        .then(item => {
            Comment.create(req.body.comment)
                .then(comment => {
                    comment.author.id = res.locals.user._id;
                    comment.author.username = res.locals.user.name;
                    comment.save();
                    //connect comment to item
                    item.comments.push(comment);
                    item.save();
                    //redirect to show items page
                    req.flash("success_msg", "New comment created!");
                    res.redirect("/items/" + item._id);
                })
                .catch(err => console.log(err));
        })
        .catch(err => {
            console.log(err);
            res.redirect("/items");
        });
});

// COMMENTS EDIT ROUTE
router.get(
    "/items/:id/comments/:comment_id/edit",
    userAuthenticated,
    (req, res) => {
        Comment.findById(req.params.comment_id)
            .then(foundComment => {
                res.render("comments/edit", {
                    item_id: req.params.id,
                    comment: foundComment
                });
            })
            .catch(err => {
                res.redirect("back");
            });
    }
);
// COMMENTS EDIT UPDATE
router.put("/items/:id/comments/:comment_id", userAuthenticated, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment)
        .then(updatedComment => {
            req.flash("success_msg", "comment edit success");
            res.redirect("/items/" + req.params.id);
        })
        .catch(err => {
            console.log(err);
            res.redirect("back");
        });
});

//COMMENTS DELETE
router.delete(
    "/items/:id/comments/:comment_id",
    userAuthenticated,
    (req, res) => {
        Comment.findByIdAndDelete(req.params.comment_id)
            .then(comment => {
                req.flash("success_msg", "Comment deleted!");
                res.redirect("/items/" + req.params.id);
            })
            .catch(err => console.log(err));
    }
);
module.exports = router;
