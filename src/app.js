const express = require('express');
const app = express();
const path = require("path");
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config();
const hbs = require('hbs');
const nodemailer = require("nodemailer");
const port = process.env.PORT || 3000;
require("./db/conn");


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
// const getRoute = require('./routes/get')

//ROUTE MIDDLEWARES

app.use('/api/users', authRoute);  
app.use('/posts', postsRoute);
// app.use('/get', getRoute);

//MIDDLEWARE

app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}));

//ROUTES

app.get('/', (req, res) =>{
    res.render('index.hbs', { title: 'Home' });
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
            user: process.env.GMUSER,
            pass: process.env.GMPASS,
        }
    })

    const mailOptions = {
        from: req.body.email,
        to: 'Ahmadqazmi69@gmail.com',
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
