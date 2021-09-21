const express = require('express');
const app = express();
const hbs = require('hbs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const path = require('path');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000;
require("./db/conn");
const Register = require("./models/user");
const auth = require("./middleware/auth");

const gmUser = process.env.GM_USER;
const gmPass = process.env.GM_PASS;

const static_path = path.join(__dirname, "../public" );
const template_path = path.join(__dirname, "../template/views" );
const partials_path = path.join(__dirname, "../template/partials" );


app.set("view engine", "hbs");
app.set("views", template_path);
app.use(express.static(static_path));
hbs.registerPartials(partials_path);

//Import routes

const postsRoute = require('./routes/posts');
const authRoute = require('./routes/auth');

//Express Body Parser MIDDLEWARE

app.use(express.json());
app.use(express.urlencoded({extended: false}));


// Cookies

app.use(cookieParser())

// Express session

app.use(session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true,
      cookie: {maxAge: null}
    })
);


// Flash messages middleware

app.use((req, res, next) =>{
    res.locals.message = req.session.message
    delete req.session.message
    next()
});

//ROUTES

app.get('/', (req, res) =>{
    res.render('index.hbs', { title: 'Home' });
});

app.get('/PrivacyPolicy.html', (req, res) =>{
    res.render('privacypolicy.hbs')
});

app.get('/Termscondition.html', (req, res) =>{
    res.render('termscondition.hbs')
});


app.get('/Remedies.html', auth , (req, res) =>{
    req.session.message = {
        type: 'Sucess',
        intro: 'Welcome  ',
        message: 'this is the member only area! Enjoy'
    }
    res.render('remediesjwt.hbs')
    delete req.session.message
});

app.get('/Remedies.html/*', (req, res) =>{
    res.render('404.hbs', {
        errorcomment: "Page cannot be found in Remedies"
    })
});

app.get('/Contact.html', (req, res) =>{
    res.render('contactus.hbs')
});

app.post('/Contact.html', (req, res) =>{
    console.log(req.body)
    try{
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmUser,
                pass: gmPass
            }
        })

        const mailOptions = {
            from: req.body.email,
            to: gmUser,
            subject: `Message from ${req.body.email}: Query from A'ashab-ul-Hayyat audience!`,
            text: `${req.body.message} \n \nFrom ${req.body.name}`,
        }

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
                req.session.message = {
                    type: 'Backend Problem',
                    intro: 'Something went wrong',
                    message: 'Cannot send the query please try again later'
                }
                res.redirect('/Contact.html')
                delete req.session.message
            } else {
                console.log('Email sent: ' + info.response);
                req.session.message = {
                    type: 'Sucess',
                    intro: 'Message sent successfully  ',
                    message: 'we will get to you as soon as possible'
                }
                res.redirect('/Contact.html')
                delete req.session.message
            }
        });

    } catch {
        
        req.session.message = {
            type: 'Backend Problem',
            intro: 'Something went wrong ',
            message: 'Cannot send the query please try again later'
        }
        res.redirect('/Contact.html')
        delete req.session.message
    }

});


app.get('/Login.html', (req, res) =>{
    res.render('login.hbs')
});

app.get('/Login.html/Register.html', (req, res) =>{
    res.render('register.hbs')
});

app.post('/Login.html', async (req, res) =>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const useremail = await Register.findOne({email:email});

        if(useremail) {
            const validpass = await bcrypt.compare(password, useremail.password);

            const token = await useremail.generateAuthToken();
            console.log(token);

            res.cookie("keyrem", token, {
                expires:new Date(Date.now() + 5000000),
                httpOnly:true,
                // secure:true
            });

            if(validpass) {
                req.session.message = {
                    type: 'Sucess',
                    intro: 'Login sucessfull ',
                    message: 'Welcome to Remedies Member only area! Enjoy'
                }
                res.status(201).redirect('/Remedies.html')
                delete req.session.message
            } else {
                req.session.message = {
                    type: 'Danger',
                    intro: 'Wrong Credentials ',
                    message: 'Either email or password is not correct'
                }
                res.status(400).redirect('/Login.html')
                delete req.session.message
            }
        } else {
            req.session.message = {
                type: 'Danger',
                intro: 'Email does not exsits ',
                message: 'Please use another Email or Register'
            }
            res.redirect('/Login.html')
            delete req.session.message
        }
    } catch (err){
        res.status(400).send(err);
        req.session.message = {
            type: 'Backend Problem',
            intro: 'Something went wrong ',
            message: 'Cannot login please try again later'
        }
        res.redirect('/')
    }
});

app.get('/Logout.html', auth , async (req, res) =>{
    try {
        req.user.tokens = req.user.tokens.filter((instance) => {
                return instance.token !== req.token
        });

        res.clearCookie("keyrem");

        console.log("Logged out sucessfully");

        await req.user.save();

        req.session.message = {
            type: 'Sucess',
            intro: 'Logged Out Sucessfully ',
            message: 'login or register!'
        }
        res.redirect('/Login.html')
        delete req.session.message

    } catch (error) {
        res.status(500).redner('index.hbs')
        req.session.message = {
            type: 'Backend problem',
            intro: 'Something went wrong ',
            message: 'please try again later'
        }
        
    }
});

app.get('/Register.html', (req, res) =>{
    res.render('register.hbs')
});

//Creating a new used in DB

app.post('/Register.html', async (req, res) => {
    
    try{
        const registerUser = new Register({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })

        const useremail = await Register.findOne({email:registerUser.email});

        if(registerUser.name == '' || registerUser.email == '' || registerUser.password == '') {
            req.session.message = {
                type: 'Danger',
                intro: 'Empty fields ',
                message: 'Please fill all the required fields'
            }
            res.redirect('/Register.html')
            delete req.session.message
        }
        else if(useremail) {
            req.session.message = {
                    type: 'Danger',
                    intro: 'Email already exsits ',
                    message: 'Please use another Email or Login using the exisiting Email'
            }
            res.redirect('/Register.html')
            delete req.session.message
        } 
        else if(registerUser.password.length < 6) {
            req.session.message = {
                type: 'Danger',
                intro: 'Password too short ',
                message: 'Please enter a password of at least 6 characters'
            }
            res.redirect('/Register.html')
            delete req.session.message
        }
        else {
            bcrypt.genSalt(10, (err, salt) => 
            bcrypt.hash(registerUser.password, salt, async (err, hash) => {
                if(err) console.log(err);

                registerUser.password = hash;
                
                const token = await registerUser.generateAuthToken()
                console.log(token);
                
                res.cookie("keyrem", token, {
                    expires:new Date(Date.now() + 50000),
                    httpOnly:true
                    // secure:true
                });

                registerUser.save()
                    .then(user => {
                        res.status(201).redirect('/Login.html')}
                    )
                    .catch(error => console.log(error))
                })
            )
            req.session.message = {
                type: 'Sucess',
                intro: 'Registration sucessful ',
                message: 'Please Login'
            }
        }

    } catch (err){
        res.status(400).send(err);
        req.session.message = {
            type: 'Backend Problem',
            intro: 'Something went wrong ',
            message: 'Cannot register user please try again later'
        }
        res.redirect('/')
        delete req.session.message
    }
});

app.get('/register.html/Login.html', (req, res) =>{
    res.redirect('/Login.html')
});

app.get('/register.html/Login.html', (req, res) =>{
    res.redirect('/Login.html')
});

app.get('/Login.html/Login.html', (req, res) =>{
    res.redirect('/Login.html')
});

app.get('/Login.html/Contact.html', (req, res) =>{
    res.redirect('/Contact.html')
});

app.get('/Login.html/Remedies.html', (req, res) =>{
    res.redirect('/Remedies.html')
});

app.get('*', (req, res) =>{
    res.render('404.hbs', {
        errorcomment: "OPSSSS! nothing found here!"
    })
});


///Active Directory Navbar Highlight///



//Server live realod for updating HTML and CSS files in browser, only for development session

var livereload = require('livereload');
const { response } = require('express');
var lrserver = livereload.createServer({
    exts: ['js', 'css', 'hbs', 'html', 'svg']
});
lrserver.watch(partials_path);
lrserver.watch(template_path);
lrserver.watch(static_path);

//Server listening port

app.listen(port, () => {
    console.log(`Server is Up and Running at port: ${port}`)
});
