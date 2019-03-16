const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    secretToken: {
        type: String
    },
    active: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("User", UserSchema);
