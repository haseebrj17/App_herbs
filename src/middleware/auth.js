const jwt = require("jsonwebtoken");
const Register = require("../models/user");
require('dotenv').config();


const auth = async (req, res, next) =>{
    try {
        const token = req.cookies.keyrem;
     
        if (token){ 
            const userVerified = jwt.verify(token, process.env.SEC_KEY);
            console.log('User is authentic');

            const user = await Register.findOne({_id:userVerified._id})

            console.log(user);

            req.token = token;
            req.user = user;
            
            next();
        } else {
            res.render('remedies.hbs')
        }

    } catch (error) {
        res.status(401).send(error);
        req.session.message = {
            type: 'Danger',
            intro: 'Invalid Token ',
            message: 'please try again later'
        }
        res.redirect('/')
    }
}


module.exports = auth;
