const mongoose = require("mongoose");
//basically details of each video

const sectionSchema = new mongoose.Schema({
    
    sectionName:{
        type:String,
    },
    subSection: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"SubSection",
        }
    ],
    
});

module.exports = mongoose.model("Section", sectionSchema);