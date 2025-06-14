const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");


//create course 
exports.createCourse = async (req, res) => {
    try{
        //fetch data
            const {courseName, courseDescription, whatYouWillLearn, price, category} = req.body;

        // get thummbnail
            const thumbnail = req.files.thumbnailImage;

        //validation
            if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail) {
                return res.status(400).json({
                    success:false,
                    message:"All fields are required,"
                });
            }    

        //check for instructor
            const userId = req.user.id; 
            const instructorDetails = await User.findById(userId);
            console.log("Instructor Details: ", instructorDetails);
            
            if(!instructorDetails) {
                return res.status(404).json({
                    success:false,
                    message:"Instructor details not found",
                });
            }

        //check given category is valid or not
            const categoryDetails = await Category.findById(category); //course schema me category is a reference to category schema, hence this category is an object id 
            if(!categoryDetails) {
                return res.status(404).json({
                    success:false,
                    message:"category details not found",
                });
            }

        //upload image to cloudinary
            const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create entry for new course in db
            const newCourse = await Course.create({
                courseName,
                courseDescription,
                instructor:instructorDetails._id,
                whatYouWillLearn,
                price,
                category:categoryDetails._id,
                thumbnail:thumbnailImage.secure_url,
            });

        //add the new course to user schema of instructor
            await User.findByIdAndUpdate( 
                {_id: instructorDetails._id}, 
                {
                    $push:{
                        courses:newCourse._id,
                    }
                },
                {new:true},
            );
        
        //update category schema
            await Category.findByIdAndUpdate(
                { name: category}, 
                {
                    $push:{
                        course:newCourse._id,
                    }
                },
                {new:true},
            );
        
        //return response
            return res.status(200).json({
                success:true, 
                message: "Course Created Successfully",
                data:newCourse,
            });
    
    } catch(error) {
        console.log(error);
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Failed to create course",
        });        
    }
}


//get all courses
exports.showAllCourses = async (req, res) => {
    try{
        const allCourses = await Course.find({}, { courseName:true,
                                                   price:true,
                                                   thumbnail:true,
                                                   instructor:true, 
                                                   ratingAndReviews:true,
                                                   studentsEnrolled:true})
                                                   .populate("instructor")
                                                   .exec();

        return res.status(200).json({
            success:true, 
            message:"Data fetched successfully",
            data:allCourses,
        })                  

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"cannot fetch course data",
            error: error.message,
        });
        
    }
}

//HW: make another controller gerCourseDetail
//get each and every detail of the course with all sections and subSections using courseId