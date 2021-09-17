const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 6,
        required: true,
        max: 255
    },
    email: {
        type: String,
        max: 400,
        unique: true,
        required: true,
        index: true
    },
    password: {
        type: String,
        min: 6,
        required: true,
        max: 1024
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Register = mongoose.model("User", userSchema);

module.exports = Register;