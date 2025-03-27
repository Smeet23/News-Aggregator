const mongoose = require('mongoose');


const connectDb = mongoose.connect('mongodb+srv://smeetagrawal23:smeetagrawal@cluster0.ymojbvc.mongodb.net/')
.then(()=>console.log("Database connected")) // if your database has auth 
.catch((err)=>console.log(err));


module.exports = connectDb;