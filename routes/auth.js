const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const passport = require("passport");
const randomString = require("randomstring");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API);

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
                //generate verify string
                const secretToken = randomString.generate();
                //flag account as inactive
                const active = false;
                //create new user
                const newUser = new User({
                    name,
                    email,
                    password,
                    secretToken,
                    active
                });
                // sending verification email to client
                const msg = {
                    to: email,
                    from: "no-reply@gear-hub-app.herokuapp.com",
                    subject: "Welcome to GearHub",
                    html: `Hi there, ${name}<br/>
                    Thank you for registering at GearHub!<br/>
                    Please verify your email by copy/pasting the following token:<br/>
                    ${secretToken}<br/>
                    at<br/>
                    <a href="https://gear-hub-app.herokuapp.com/verify">GearHub</a>`
                };
                sgMail.send(msg);

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => {
                                req.flash(
                                    "success_msg",
                                    "Registered, please check your email or email spam folder"
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

// VERIFY
router.get("/verify", (req, res) => {
    res.render("verify");
});

//VERIFY POST
router.post("/verify", (req, res) => {
    const secretToken = req.body.secretToken;
    User.findOne({ secretToken: secretToken.trim() })
        .then(user => {
            if (!user) {
                req.flash("error_msg", "invalid token");
                res.redirect("/verify");
                return;
            }
            user.active = true;
            user.secretToken = "";
            user.save();

            req.flash("success_msg", "Success, please log in");
            res.redirect("/login");
        })
        .catch(err => console.log(err));
});

//LOGOUT
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "Logged out");
    res.redirect("/login");
});

module.exports = router;
