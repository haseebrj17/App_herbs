const express = require('express');
const app = express();
const path = require("path");
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const hbs = require('hbs');
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const port = process.env.PORT || 3000;
require("./db/conn");
const Register = require("./models/user");



const static_path = path.join(__dirname, "../public" );
const template_path = path.join(__dirname, "../template/views" );
const partials_path = path.join(__dirname, "../template/partials" );

app.set("views", template_path);
app.use(express.static(static_path));

app.use(express.json());

app.set("view engine", "hbs");

hbs.registerPartials(partials_path);

//Import routes

const postsRoute = require('./routes/posts');
const authRoute = require('./routes/auth');

//MIDDLEWARE

app.use(express.json());
app.use(express.urlencoded({extended: true}));

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

    transporter.sendMail(mailOptions, (error, info)=>{
        if(error){
            console.log(error);
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

app.get('/Register.html', (req, res) =>{
    res.render('register.hbs')
});

//Creating a new used in DB

app.post('/Register.html', async (req, res) => {
    try{
        const registerUser = new Register({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        })
        const registeredUser = await registerUser.save();
        res.status(201).render('remedies.hbs');
        
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
