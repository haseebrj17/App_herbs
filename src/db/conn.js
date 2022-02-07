const mongoose = require('mongoose');
const key = process.env.DB_CONNECT;

mongoose.connect(key).then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log("No connection to database\nDue to this error");
    console.log(err);
});
