const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.SEC_KEY;


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
    tokens:[{
        token: {
            type: String,
            required: true
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

userSchema.methods.generateAuthToken = async function(){
    try {
        const token = await jwt.sign({_id:this._id.toString()}, secretKey);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (err) {
        res.send("Something went wrong" + err);
        console.log("Something went wrong" + err);
    }
}

const Register = mongoose.model("User", userSchema);

module.exports = Register;