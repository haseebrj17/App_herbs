const mongoose = require('mongoose');
const key = process.env.DB_CONNECT;

mongoose.connect(key, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => {
    console.log(`Connected to DB`);
}).catch(() => {
    console.log(`No connection`);
    console.error();
})
