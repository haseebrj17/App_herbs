const express = require('express'); // Importing Express framework package, this will be used to create a backend server
const app = express(); // Generating an express server and giving it a name of "app", this is the backend server
const hbs = require('hbs'); // Importing Handlebars package
const session = require('express-session'); // Importing Express session package, this will be used to create and manage sessions on the browser
const cookieParser = require('cookie-parser'); // Importing Cookie parser package, this will be used to create and manage cookies in the browser
require('dotenv').config(); // Importing the configuration file of Dotenv package, this will be used to store the   enviromental variables used in the app
const mongoose = require('mongoose'); // Importing Mongoose package, this will be used as the database and also used to creat a connection and define the parameter, users etc.
const nodemailer = require('nodemailer'); // Importing nodemailer package, this will be used to send the message from the Contact us page.
const bcrypt = require('bcryptjs'); // Importing the Bcryptjs package, this will be used to encrypt and decrypt the password that is stored in the database
const jwt = require('jsonwebtoken'); // Importing the Jsonwebtoken package, this will be used the generate, cypher, decypher, and authenticate the Json Web Token. 
require("./db/conn"); // Importing the Database connection code form the file "conn.js" on the "db" directory, this is used to connect the app to the database
const Register = require("./models/user"); // Importing the user schema form the "user.js" file in the "models" directory, in this file the new registration parameter, variales and values are defined
const auth = require("./middleware/auth"); // Importing the "auth" file from the "middleware" directory, this is the code for authenticate if users are logged in when visitng member only area "remediesjwt.hbs"
const cloudinary = require('cloudinary')
const gmUser = process.env.GM_USER; // Importing the GM_USER enviromental variable from the Dotenv (.env) file, this will be used as a credential by the Nodemailer package to send the emails
const gmPass = process.env.GM_PASS; // Importing the GM_PASS enviromental variable from the Dotenv (.env) file, this will be used as a credential by the Nodemailer package to send the emails
const logKey = process.env.SEC_KEY_SES; // Importing the SEC_KEY_SES enviromental variable from the Dotenv (.env) file, the value of this variable will be used by the Express-session to secure the session on the browser.
const port = process.env.PORT || 3000; // Importing the PORT enviromental variable from the Dotenv (.env) file, this will be the port used by the app. Also defineing a alternative port (3000)
const path = require('path'); // Importing Path package, this will be used to define the path of the directories that are used in the app in refrence to the Root directory
const static_path = path.join(__dirname, "../public" ); 
const template_path = path.join(__dirname, "../template/views" );
const partials_path = path.join(__dirname, "../template/partials" );

app.set("view engine", "hbs");
app.set("views", template_path);
app.use(express.static(static_path));
hbs.registerPartials(partials_path);

//Cloudianry Config

cloudinary.config({ 
    cloud_name: 'hs8ey0x0j', 
    api_key: '476421252652826', 
    api_secret: 'pmid43-PLwOPz2BG2XTvTQnZlNM',
    secure: true
});

//Express Body Parser MIDDLEWARE

app.use(express.json());
app.use(express.urlencoded({extended: false}));


// Cookies MIDDLEWARE

app.use(cookieParser());

// Express session

app.use(session({
      key: 'flash_sid',
      secret: logKey,
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

// Navigation Bar Middleware Variable that will determine whether "Login" or "Logout" will appeare.

var logData = {loggedIn: false, errorComment: "Page cannot be found"};

//ROUTES

app.get('/', (req, res) =>{
    if (req.cookies.keyrem && req.cookies.log) {
        logData.loggedIn = true;
        res.render('index.hbs', logData)
    } else {
        logData.loggedIn = false;
        res.render('index.hbs', logData)
    }
});

app.get('/PrivacyPolicy.html', (req, res) =>{
    res.render('privacypolicy.hbs')
});

app.get('/Termscondition.html', (req, res) =>{
    res.render('termscondition.hbs')
});

app.get('/Remedies.html', auth , (req, res) =>{
    logData.loggedIn = true;
    req.session.message = {
        type: 'Success',
        intro: 'Welcome  ',
        message: 'this is the member only area! Enjoy'
    }
    res.render('remediesjwt.hbs', logData)
    delete req.session.message
});

app.get('/Remedies.html/*', (req, res) =>{
    res.render('404.hbs', logData)
});


app.get('/Contact.html', (req, res) =>{
    if (req.cookies.keyrem && req.cookies.log) {
        logData.loggedIn = true;
        res.render('contactus.hbs', logData)
    } else {
        logData.loggedIn = false;
        res.render('contactus.hbs', logData)
    }
});

app.get('/Contact.html/*', (req, res) =>{
    if (req.cookies.keyrem && req.cookies.log) {
        logData.loggedIn = true;
        res.render('404.hbs', logData)
    } else {
        logData.loggedIn = false;
        res.render('404.hbs', logData)
    }
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
                    type: 'Success',
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
    if (req.cookies.keyrem && req.cookies.log) {
        logData.loggedIn = true;
        res.render('login.hbs', logData)
    } else {
        logData.loggedIn = false;
        res.render('login.hbs', logData)
    }
});

app.get('/Login.html/*', (req, res) =>{
    if (req.cookies.keyrem && req.cookies.log) {
        logData.loggedIn = true;
        res.render('404.hbs', logData)
    } else {
        logData.loggedIn = false;
        res.render('404.hbs', logData)
    }
});

app.get('/Login.html/Register.html', (req, res) =>{
    if (req.cookies.keyrem && req.cookies.loglog) {
        logData.loggedIn = true;
        res.render('register.hbs', logData)
    } else {
        logData.loggedIn = false;
        res.render('register.hbs', logData)
    }
});

app.post('/Login.html', async (req, res) =>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userEmail = await Register.findOne({email:email});

        if(userEmail) {
            const validpass = await bcrypt.compare(password, userEmail.password);

            if(validpass) {
                const token = await userEmail.generateAuthToken();
                console.log(token);

                res.cookie("keyrem", token, {
                    expires:new Date(Date.now() + 5000000),
                    httpOnly:true,
                    secure:true
                });

                
                res.cookie("log", 0, {
                    expires:new Date(Date.now() + 5000000),
                    httpOnly:true,
                    secure:true
                })
                req.session.message = {
                    type: 'Success',
                    intro: 'Login successful ',
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

        res.clearCookie("log");

        console.log("Logged out successfully");

        await req.user.save();

        req.session.message = {
            type: 'Success',
            intro: 'Logged Out Successfully ',
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
    if (req.cookies.keyrem && req.cookies.log) {
        logData.loggedIn = true;
        res.render('register.hbs', logData)
    } else {
        logData.loggedIn = false;
        res.render('register.hbs', logData)
    }
});

//Creating a new user in DB

app.post('/Register.html', async (req, res) => {
    
    try{
        const registerUser = new Register({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })

        const userEmail = await Register.findOne({email:registerUser.email});

        if(registerUser.name == '' || registerUser.email == '' || registerUser.password == '') {
            req.session.message = {
                type: 'Danger',
                intro: 'Empty fields ',
                message: 'Please fill all the required fields'
            }
            res.redirect('/Register.html')
            delete req.session.message
        }
        else if(userEmail) {
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
        else if(registerUser == '') {
            req.session.message = {
                type: 'Danger',
                intro: 'Connection Issues ',
                message: 'Please connect to internet, or there is a problem in our backend'
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

                registerUser.save()
                    .then(user => {
                        res.status(201).redirect('/Login.html')}
                    )
                    .catch(error => console.log(error))
                })
            )
            req.session.message = {
                type: 'Success',
                intro: 'Registration successful ',
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
    if (req.cookies.keyrem && req.cookies.log) {
        logData.loggedIn = true;
        res.render('404.hbs', logData)
    } else {
        logData.loggedIn = false;
        res.render('404.hbs', logData)
    }
});

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