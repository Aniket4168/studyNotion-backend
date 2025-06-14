const mongoose = require("mongoose");
//basically details of each video

const subSectionSchema = new mongoose.Schema({
    
    title:{
        type:String,
    },
    timeDuration:{
        type:String,
    },
    description:{
        type:String,
    },
    videoUrl:{
        type:String,
    },
    
})

module.exports = mongoose.model("SubSection", subSectionSchema);