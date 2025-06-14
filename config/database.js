const mongoose = require("mongoose");
require("dotenv");

exports.connectDb = () => {
    mongoose.connect(process.env.DATABASE_URL, {})
    .then(()=> {
        console.log("db connected successfully");    
})
    .catch((error) => {
        console.log("error in db connection");
        console.error(error);
        process.exit(1);        
    })
}
