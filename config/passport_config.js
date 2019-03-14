const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");

const User = require("../models/user");

module.exports = function(passport) {
    passport.use(
        new LocalStrategy(
            {
                usernameField: "email"
            },
            (email, password, done) => {
                // Match user
                User.findOne({ email: email }).then(user => {
                    if (!user) {
                        return done(null, false, {
                            message: "Email not registered"
                        });
                    }
                    // Check pass
                    bcrypt.compare(password, user.password, (err, match) => {
                        if (err) throw err;
                        if (match) {
                            return done(null, user);
                        } else {
                            return done(null, false, {
                                message: "Incorrect Password"
                            });
                        }
                    });
                });
            }
        )
    );
};

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});
