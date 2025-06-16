const mongoose = require("mongoose");

//isme mainly particular course kon sa hai and uske kitne video complete kar liye
// videos are referenced as subsections
// there are multiple sections in a course
//each section has some subsections
// each subsection basically denotes a video

const courseProgress = new mongoose.Schema({
    
    courseID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },
    userID: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
    completedVideos: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"SubSection",
        }
    ]
   
    
})

module.exports = mongoose.model("CourseProgress", courseProgress);

