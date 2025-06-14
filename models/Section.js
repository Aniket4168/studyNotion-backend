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
            ref:"Subsection",
        }
    ],
    
});

module.exports = mongoose.model("Section", sectionSchema);