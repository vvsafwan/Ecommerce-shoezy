const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/shoezy');
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const userRoute = require('./routes/userroute');
const adminRoute = require('./routes/adminroute');
const dotenv = require('dotenv')
dotenv.config();

app.use((req, res, next) => {
    res.header(
      "Cache-Control",
      "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// app.use(morgan('dev'))

app.use(express.static('public/users'));
app.use(express.static('public/admin'));

app.use('/',userRoute);
app.use('/admin',adminRoute);

app.listen(process.env.PORT,()=>{
    console.log("Started on localhost 3000");
})