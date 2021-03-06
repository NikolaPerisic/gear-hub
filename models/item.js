const mongoose = require("mongoose");

//Schema Setup
let itemSchema = new mongoose.Schema({
    name: String,
    image: String,
    review: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

module.exports = mongoose.model("Item", itemSchema);
