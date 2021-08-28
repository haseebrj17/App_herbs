const mongoose = require('mongoose');
const key = process.env.DB_CONNECT;

mongoose.connect('mongodb+srv://dbappconn:holladb@cluster0.cl0rw.mongodb.net/Aashabulhayyat?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
}).then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log("No connection");
    console.log(err);
});
