const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const passport = require("passport");

// AUTHENTICATION ROUTES

//LOGIN
router.get("/login", (req, res) => res.render("login"));

//REGISTER
router.get("/register", (req, res) => res.render("register"));

//REGISTER POST
router.post("/register", (req, res) => {
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
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
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
                });
            }
        });
    }
});

//LOGIN POST
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/items",
        failureRedirect: "/login",
        failureFlash: true
    })(req, res, next);
});

//LOGOUT
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "Logged out");
    res.redirect("/login");
});

module.exports = router;
