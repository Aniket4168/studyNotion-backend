const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.updateProfile = async (req, res) => {
    try{
        //fetch data
            const {dateOfBirth="", about="", contactNumber ,firstName,lastName, gender} = req.body;

        //get userId
            const userId = req.user.id;

        //validation
            if(!contactNumber || !gender) {
                return res.status(400).json({
                    success:false,
                    message:"Contact Number and gender are mandatory",
                });
            }

        //find profile
            const userDetails = await User.findById(userId);
            const profileId = userDetails.additionalDetails;

            const profileDetails = await Profile.findById(profileId);

        //update profile

            //we can either use create function or save funtion, both are correct
            userDetails.firstName = firstName || userDetails.firstName;
		    userDetails.lastName = lastName || userDetails.lastName;
            profileDetails.dateOfBirth = dateOfBirth;
            profileDetails.about= about;
            profileDetails.gender =gender;
            profileDetails.contactNumber = contactNumber;

            await profileDetails.save();
            await userDetails.save();

        //return response
            return res.status(200).json({
                success:true,
                message:"Profile Details Updated Successfully",
                profileDetails,
            });
    } catch(error) {
        return res.status(500).json({
            success:false,
            message:"Something went wring while Updating the profile",
            error:error.message,
        });
    }
}

//delete account
exports.deleteAccount = async (req, res) => {
    try{
        //get id
            const id = req.user.id;
        //validation
            const userDetails = await User.findById(id);
            if(!userDetails) {
                return res.status(404).json({
                    success:false,
                    message:"User not found",
                });
            }

        //delete profile
            await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

        //delete user
            await User.findByIdAndDelete({_id:id});

        //return res
            return res.status(200).json({
                success:true,
                message:"Account deleted successfully",
            });

    } catch(error) {
        return res.status(500).json({
            success:false,
            message:"something went wrong while deleting the account",
        });
    }
}

exports.getAllUserDetails = async (req, res) => {
    try{
        //get id
            const id= req.user.id;

        //validate and get user details
            const userDetails = await User.findById(id).populate("additionalDetails").exec();
            console.log(userDetails);
            
        //return response
            return res.status(200).json({
                success:true,
                message:"User Data Fetched Successfully",
                userDetails,
            });
    }

    catch(error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.getEnrolledCourses=async (req,res) => {
	try {
        const id = req.user.id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const enrolledCourses = await User.findById(id).populate({
			path : "courses",
				populate : {
					path: "courseContent",
			}
		}
		).populate("courseProgress").exec();
        // console.log(enrolledCourses);
        res.status(200).json({
            success: true,
            message: "User Data fetched successfully",
            data: enrolledCourses,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

//updateDisplayPicture
exports.updateDisplayPicture = async (req, res) => {
	try {

		const id = req.user.id;
	const user = await User.findById(id);
	if (!user) {
		return res.status(404).json({
            success: false,
            message: "User not found",
        });
	}
	const image = req.files.displayPicture;
	if (!image) {
		return res.status(404).json({
            success: false,
            message: "Image not found",
        });
    }
	const uploadDetails = await uploadImageToCloudinary(
		image,
		process.env.FOLDER_NAME
	);
	console.log(uploadDetails);

	const updatedImage = await User.findByIdAndUpdate({_id:id},{image:uploadDetails.secure_url},{ new: true });

    res.status(200).json({
        success: true,
        message: "Image updated successfully",
        data: updatedImage,
    });
		
	} catch (error) {
		return res.status(500).json({
            success: false,
            message: error.message,
        });
		
	}



}

//instructor dashboard
exports.instructorDashboard = async (req, res) => {
	try {
		const id = req.user.id;
		const courseData = await Course.find({instructor:id});
		const courseDetails = courseData.map((course) => {
			totalStudents = course?.studentsEnrolled?.length;
			totalRevenue = course?.price * totalStudents;
			const courseStats = {
				_id: course._id,
				courseName: course.courseName,
				courseDescription: course.courseDescription,
				totalStudents,
				totalRevenue,
			};
			return courseStats;
		});
		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: courseDetails,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}