const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const preloadDB = require("./preloadDB");
require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

const itemsRoutes = require("./routes/items");
const commentsRoutes = require("./routes/comments");
const authRoutes = require("./routes/auth");

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
require("./config/passport_config")(passport);
app.use(passport.initialize());
app.use(passport.session());

// CONNECT FLASH
app.use(flash());

// PASS FLASH MSGS AND AUTH STATUS TO TEMPLATE
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.user = req.user;
    next();
});

app.use(itemsRoutes);
app.use(commentsRoutes);
app.use(authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`App running on ${PORT}`);
});
