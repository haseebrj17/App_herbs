// const express = require('express');
// const app = express();
// const router = express.Router();


// app.get('/', (req, res) =>{
//     res.render('index.hbs');
// });


// app.get('/Remedies.html', (req, res) =>{
//     res.render('remedies.hbs')
// });

// app.get('/Remedies.html/*', (req, res) =>{
//     res.render('404.hbs', {
//         errorcomment: "Page cannot be found in Remedies"
//     })
// });

// app.get('/Contact.html', (req, res) =>{
//     res.render('contactus.hbs')
// });

// app.get('/Login.html', (req, res) =>{
//     res.render('login.hbs')
// });

// app.get('/Login.html/register.html', (req, res) =>{
//     res.render('register.hbs')
// });

// app.get('/Register.html', (req, res) =>{
//     res.render('register.hbs')
// });


// app.get('/register.html/Login.html', (req, res) =>{
//     res.redirect('/Login.html')
// });

// app.get('/register.html/Login.html', (req, res) =>{
//     res.redirect('/Login.html')
// });

// app.get('/Login.html/Login.html', (req, res) =>{
//     res.redirect('/Login.html')
// });

// app.get('/Login.html/Contact.html', (req, res) =>{
//     res.redirect('/Contact.html')
// });

// app.get('/Login.html/Remedies.html', (req, res) =>{
//     res.redirect('/Remedies.html')
// });


// app.get('*', (req, res) =>{
//     res.render('404.hbs', {
//         errorcomment: "OPSSSS! nothing found here!"
//     })
// });

// module.exports = router;