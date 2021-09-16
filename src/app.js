const express = require('express');
const app = express();
const hbs = require('hbs');
const session = require('express-session');
const dotenv = require('dotenv').config({path:'/src/.env'});
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const path = require('path');
const port = process.env.PORT || 3000;
require("./db/conn");
const Register = require("./models/user");



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

// Express session
app.use(session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
);

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

app.get('/Remedies.html', (req, res) =>{
    res.render('remedies.hbs')
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

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'aashabulhayyat2021@gmail.com',
            pass: 'hayyat1990',
        }
    })

    const mailOptions = {
        from: req.body.email,
        to: 'aashabulhayyat2021@gmail.com',
        subject: `Message from ${req.body.email}: Query from A'ashab-ul-Hayyat audience!`,
        text: `${req.body.message} \nFrom ${req.body.name}`,
    }

    transporter.sendMail(mailOptions, (err, info)=>{
        if(err){
            console.log(err);
            res.send('Error');
        }else{
            console.log('Email sent: ' + info.response);
            res.send('Success');
        }
    })

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
        
        if(useremail.password === password){
            res.status(201).redirect('/Remedies.html')
        }else{
            res.send("Either Email or Password is not correct")
        }

    } catch{
        res.status(400).send("Invalid Credentials")
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
        
        // const emailExits = user.findOne({ email: req.body.email });
        // if(emailExits) return res.status(400).send('Email already exits');

        registerUser.save();
        res.status(201).redirect('/Login.html');
            
        
        bcrypt.genSalt(10, (err, salt) => 
            bcrypt.hash(registerUser.password, salt, (hash) => {
                if(err) console.log(err);

                registerUser.password = hash;

                registerUser.save()
                    .then(user => {
                        res.status(201).redirect('/Login.html')}
                    )
                    .catch(error => console.log(error))
            
            })
        );
        
    } catch (err) {
        res.status(400).send(err);
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
