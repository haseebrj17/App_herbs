const { route } = require('./posts');
const router = require('express').Router();
const users = require('../models/user');

router.post('/register', async (req, res) => {
    const user = new users({ 
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });
    try{
        const savedUser = await user.save();
        res.send(savedUser);
    }catch(err){
        res.status(400).send(err);
    }

});


module.exports = router;
