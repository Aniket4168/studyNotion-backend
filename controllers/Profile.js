const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
    try{
        //fetch data
            const {dateOfBirth="", about="", contactNumber, gender} = req.body;

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
            profileDetails.dateOfBirth = dateOfBirth;
            profileDetails.about= about;
            profileDetails.gender =gender;
            profileDetails.contactNumber = contactNumber;

            await profileDetails.save();

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

        //return response
            return res.status(200).json({
                success:true,
                message:"User Data Fetched Successfully",
            });
    }

    catch(error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}