const express = require('express');
const app = express();
const path = require("path");
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config();
const hbs = require('hbs');
// const livereload = require('livereload');
const port = process.env.PORT || 3000;
const key = process.env.DB_CONNECT;
require("./db/conn");

const static_path = path.join(__dirname, "../public" );
const template_path = path.join(__dirname, "../template/views" );
const partials_path = path.join(__dirname, "../template/partials" );

app.set("views", template_path);
app.use(express.static(static_path));

app.set("view engine", "hbs");

hbs.registerPartials(partials_path);

//Import routes

const postsRoute = require('./routes/posts');
const authRoute = require('./routes/auth');


//ROUTE MIDDLEWARES

app.use('/api/users', authRoute);  
app.use('/posts', postsRoute);

//MIDDLEWARE

app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}));

//ROUTES

app.get('/', (req, res) =>{
    res.render('index.hbs');
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


app.get('/Login.html', (req, res) =>{
    res.render('login.hbs')
});

app.get('/register.html', (req, res) =>{
    res.render('register.hbs')
});


app.get('/Contact.html', (req, res) =>{
    res.render('404.hbs', {
        errorcomment: "Page cannot be found"
    })
});


///Active Directory Navbar Highlight///



//process ENV

/*let key = process.env.DB_CONNECT;*/

//Connect to DB

/*mongoose.connect(key,
    { useUnifiedTopology: true },
    () => console.log('Connected to DB'),
);*/

//Server live realod for updating HTML and CSS files in browser, only for development session

var livereload = require('livereload');
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
