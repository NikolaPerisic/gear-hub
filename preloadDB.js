const mongoose = require("mongoose");
const Item = require("./models/item");
const Comment = require("./models/comment");

const data = [
    {
        name: "DJI Mavic Pro",
        image:
            "https://raw.githubusercontent.com/NikolaPerisic/temp-img/master/images/dji_mavicpro.jpeg",
        review:
            "One of the best drones on the market. The Mavic Pro's camera is small but fairly powerful on paper: its 1/2.3-inch sensor can capture 12MP stills in JPEG or DNG RAW format, as well as video at a variety of resolutions and frame rates: 4K at 30fps or 1080p at up to 96fps"
    },
    {
        name: "Ecovacs Deebot N79S",
        image:
            "https://raw.githubusercontent.com/NikolaPerisic/temp-img/master/images/ecovacsDEEBOT_N79S.jpg",
        review:
            "N79S/SE provides a versatile cleaning solution. With the Smart Motion system and multiple cleaning modes, N79S/SE efficiently cleans your floor and has an appropriate cleaning mode for every job. You can also control your robot with ECOVACS App or smart home system, and enjoy all the convenience!"
    },
    {
        name: "Lifx A19 smart home bulb",
        image:
            "https://raw.githubusercontent.com/NikolaPerisic/temp-img/master/images/lifx_A19.jpg",
        review:
            "LIFX is bright, delivering over 1100 lumens from just 11 watts. This is the equivalent of a traditional 75W incandescent bulb, add in 16 million colors and integrations with leading connected home devices. This is one clever light."
    },
    {
        name: "SJCam SJ8 Pro",
        image:
            "https://raw.githubusercontent.com/NikolaPerisic/temp-img/master/images/sjcam_sj8pro.jpg",
        review:
            "The SJCAM SJ8 Pro is the new flagship model and heads up the SJ8 line-up. On paper, the camera looks impressive and once out of the packaging it seems like an instant hit. Feature wise it has it all, 4K at 60fps, 1080p at 120fps and on the back, it has a large 2.33-inch touch screen."
    },
    {
        name: "Asus Zenbeam E1",
        image:
            "https://raw.githubusercontent.com/NikolaPerisic/temp-img/master/images/zenbeam_E1.jpeg",
        review:
            "ASUS ZenBeam E1 is a TV-sized screen in your pocket that's able to deliver up to 120-inch-diagonal projections. Designed with compatibility in mind, this palm-sized projector has an HDMI/MHL input to connect to everything including PCs, smartphones and media streamers. ASUS ZenBeam E1 includes a built-in 6000mAh rechargeable battery that delivers up to 5 hours of projection time when you're on the go, and doubles as a power bank for your mobile devices."
    }
];

function preloadDB() {
    // Clear all
    Item.deleteMany({}, err => {
        if (err) {
            console.log(err);
        }
        console.log("item removed");
        Comment.deleteMany({}, err => {
            if (err) {
                console.log(err);
            }
            console.log("comments removed");
            // seed with data
            data.forEach(seed => {
                Item.create(seed, (err, item) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("item added");
                        //create a comment
                        Comment.create(
                            {
                                text: "Awesome device thanks for the review",
                                author: "Bob Smith"
                            },
                            (err, comment) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    item.comments.push(comment);
                                    item.save();
                                    console.log("Created new comment");
                                }
                            }
                        );
                    }
                });
            });
        });
    });
}

module.exports = preloadDB;
