const Course = require("../models/Course");
const RatingAndReview = require("../models/RatingAndReview");


//createRatingAndReviews
exports.createRating = async (req, res) => {
    try{
        //get user id
            const userId = req.user.id;

        //fetch rating data
            const {rating, review, courseId} = req.body;

        //check if user is enrolled or not
            //we can use any other method as well
            const courseDetails = await Course.findOne(
                                    {_id:courseId,
                                        studentsEnrolled: {$elemMatch: {$eq: userId}},
                                    });

            if(!courseDetails) {
                return res.status(404).json({
                    success:false,
                    message:"Student is not enrolled in the course",
                });
            }

        //check if user already reviewed the course
            const alreadyReviewed = await RatingAndReview.findOne({
                                                user:userId,
                                                course:courseId,
                                            });
        
            if(alreadyReviewed) {
                return res.status(403).json({
                    success:false,
                    message:"Course is already reviewed by the user",
                });
            }

        //create rating and review
            const ratingReview = await RatingAndReview.create({
                                                rating, review, 
                                                course:courseId,
                                                user:userId,
                                        });

        //upadate the course model
            const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                        {
                                            $push:{
                                                ratingAndReviews: ratingReview._id,
                                            }
                                        },
                                        {new:true}
                                    );
                console.log(updatedCourseDetails);
                    
        //return res
            return res.status(200).json({
                success:true,
                message:"Rating and Review created Successfully",
            });
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });        
    }
}



//getAverageRatingAndReviews

exports.getAverageRating = async (req, res) => {
    try{
        //get course id
            const courseId = res.body.courseId;

        //calculate average rating
            const result = await RatingAndReview.aggregate([
                        {
                            $match:{
                                course: new mongoose.Types.ObjectId(courseId),
                            }                            
                        },
                        {
                            $group:{
                                _id:null,
                                averageRating : { $avg: "$rating"},
                            }
                        }
            ]);

        //return rating
            if(result.length > 0) {
                return res.status(200).json({
                    success:true,
                    averageRating : result[0].averageRating,
                });
            }

        //if no rating exist
            return res.status(200).json({
                success:true,
                message:"Average rating is 0, no ratings given till now",
                averageRating:0,
            })

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });        
    }
}

//getAllRatingAndReviews

exports.getAllRating = async (req, res) => {
    try{ 
        const allReviews = await RatingAndReview.find({})
                                    .sort({rating: "desc"})
                                    .populate({
                                        path:"user",
                                        select:"firstName lastName email image",  //we can use any method here to select particular fields to show
                                    })
                                    .populate({
                                        path:"course",
                                        select:"courseName",
                                    })
                                    .exec();
                
        return res.status(200).json

        
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while fetching all ratings and reviews"
        })
        
    }
}

//HW: get all ratings and reviews for a course
exports.getAllRatingsOfAnyCourse = async (req, res) => {
    try{
        //fetch course id
            const courseId = req.body;

        //fetch all ratings related to that course
            const allRatings = await RatingAndReview.find({course: courseId})
                                                    .sort({rating: "desc"})
                                                    .populate({
                                                        path:"user",
                                                        select:"firstName lastName email image",  //we can use any method here to select particular fields to show
                                                    })
                                                    .populate({
                                                        path:"course",
                                                        select:"courseName",
                                                    })
                                                    .exec();
        //return response
            return res.status(200).json({
                success:true,
                message:"All Ratings and Reviews fetched for the particular course",
                data:allRatings,
            });

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while fetching all ratings and reviews of the Given course"
        });
    }
}