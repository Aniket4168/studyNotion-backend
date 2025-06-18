const Course = require("../models/Course");
const Section = require("../models/Section");

exports.createSection = async (req, res) => {
    try {
        //data fetch
            const {sectionName, courseId} =req.body;

        //validate
            if(!sectionName || !courseId) {
                return res.status(400).json({
                    success:false,
                    message:"All fields are required",
                });
            }
            console.log("validation done");
            
        //create section
            const newSection = await Section.create({sectionName});
            console.log("create done");

        //update section object id in course schema
            const updatedCourseDetails = await Course.findByIdAndUpdate( courseId, 
                                                                {
                                                                    $push:{
                                                                        courseContent : newSection._id,
                                                                    }
                                                                },
                                                                {new:true},
                                                            ).populate({
                                                                path:"courseContent",
                                                                populate:{path:"subSection"}
                                                            }).exec();

                                                            

        //return response
         console.log(" done");
            return res.status(200).json({
                success:true,
                message:"Section created successfully",
                updatedCourseDetails,
            });                                            
                                                        
    } catch(error) {
        return res.status(500).json({
            success:false,
            message:"Unable to create section, please try again later",
            error:error.message,
        });
    }
}

exports.updateSection = async (req, res) => {
    try{
        //data input and validation
            const {sectionName, sectionId, courseId} = req.body;

            if(!sectionName || !sectionId) {
                return res.status(400).json({
                    success:false,
                    message:"All fields are required",
                });
            }
            
        //update data
            const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});
        
        	const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();

        //return response
            return res.status(200).json({
                success:true,
                message:"Section updated successfully",
                updatedCourse
            });



    } catch(error) {
        return res.status(500).json({
            success:false,
            message:"Unable to update section, please try again later"
        });
    }
}

exports.deleteSection = async (req, res) => {
    try{
        //get id assuming that we are sending id in params
            const {sectionId, courseId} = req.body;

        // find by id and delete
            await Section.findByIdAndDelete(sectionId);

        //TODO: WE NEED TO MAKE SURE TO UPDATE THE COURSES SCHEMA ALSO
        	const updatedCourse = await Course.findByIdAndUpdate(courseId, {
                                    $pull:{courseContent:sectionId}})
                                    .populate(
                                        { path: "courseContent", 
                                            populate: { path: "subSection" } })
                                    .exec();


            console.log(updatedCourse);
            
        //response
            return res.status(200).json({
                success:true, 
                message:"Section deleted successsfully",
            });

    } catch(error) {
        return res.status(500).json({
            success:false,
            message:"Unable to delete section, please try again later"
        });
    }
}

