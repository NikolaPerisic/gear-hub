const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const User = require("./models/user");
const Comment = require("./models/comment");
const Item = require("./models/item");
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const preloadDB = require("./preloadDB");
require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

//CONNECT TO DATABASE
mongoose
    .connect(process.env.MONGODB_URI, { useNewUrlParser: true })
    .then(() => console.log("mongodb connected"))
    .catch(err => console.log(err));

preloadDB();

// SESSION CONFIG
app.use(
    require("express-session")({
        secret: "not-bacon",
        resave: false,
        saveUninitialized: false
    })
);

// PASSPORT CONFIG
require("./config/passport_config");
app.use(passport.initialize());
app.use(passport.session());

// CONNECT FLASH
app.use(flash());

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

// AUTHENTICATION ROUTES

//LOGIN
app.get("/login", (req, res) => res.render("login"));
//REGISTER
app.get("/register", (req, res) => res.render("register"));
//REGISTER POST
app.post("/register", (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: "Please enter all required info" });
    }
    if (password !== password2) {
        errors.push({ msg: "Passwords don't match" });
    }
    if (password.length < 6) {
        errors.push({ msg: "Password must be at least 6 characters" });
    }
    if (errors.length > 0) {
        res.render("register", {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        User.findOne({ email: email }).then(user => {
            if (user) {
                errors.push({ msg: "Email already exists" });
                res.render("register", {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });
                bcrypt.genSalt(10, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => {
                            req.flash(
                                "success_msg",
                                "Registered, please log in"
                            );
                            res.redirect("/login");
                        })
                        .catch(err => console.log(err));
                });
            }
        });
    }
});
//LOGIN POST
app.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/items",
        failureRedirect: "/login",
        failureFlash: true
    })(req, res, next);
});
//LOGOUT
app.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "Logged out");
    res.redirect("/login");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`App running on ${PORT}`);
});
