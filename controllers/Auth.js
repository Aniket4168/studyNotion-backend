const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");



//send otp
exports.sendOTP = async (req, res) => {

    try{

        //fetch email from request body
        const {email} = req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({email});

        //if already exist, then return
        if(checkUserPresent) {
            return res.status(401).json({
                success:false,
                message:"User is already Registered",
            });
        }

        //generate otp
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars: false,
        });
        console.log("OTP generated: ", otp);

        //check unique otp or not
        const result = await OTP.findOne({otp:otp}); // check if OTP ke schema me otp wale object ki value == abhi jo otp aaya
        
        //using this we make sure that the otp generated must be unique
        while(result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars: false,
            });
            result = await OTP.findOne({otp:otp});
        }

        console.log("unique otp made successfully", otp);
        

        // this is a bad code above for otp generation, in actual companies, 
        // we will use otp generation services, where they ensure to give the unique otp everytime


        //now otp is generated, we need to set it in db
        const otpPayload = {email, otp};

        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return success
        res.status(200).json({
            success:true, 
            message:"OTP sent successfully",
            otp,
        });
        
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message: error.message,
        });
        
    }
}

//signup

exports.signUp = async (req, res) => {
    try{
        //fetch data

        const {
            firstName,
            lastName, 
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber, 
            otp
        } = req.body;

        //validate karo

        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            });
        }

        // 2 password match karo(main and confirm password)
        if(password !== confirmPassword ) {
            return res.status(400).json({
                success:false,
                message:"Password and Confirm Password do not match, please check passowrd",
            });
        }

        //check if alreadt exist
        const existingUser = await User.findOne({email});

        if(existingUser) {
            return res.status(400).json({
                success:false,
                message:"User already exists, please LogIn",
            });
        }

        //find the most recent otp
        const recentOtp = await OTP.find({email}).sort({createdAt: -1}).limit(1);

        //validate otp
        if(recentOtp.length === 0) {
            return res.status(400).json({
                success:false,
                message:"otp not found"
            });
        } else if(otp !== recentOtp[0].otp) {
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            });
        }   
        
        //hash the password
        const hashedPass = await bcrypt.hash(password, 10);

        let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);

        //create entry in db

        //create an empty profile kyuki user me additional details is required
        //and abhi wo nahi hai, to null se initialize kardo
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth: null,
            about:null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName, 
            lastName, 
            email, 
            contactNumber, 
            password:hashedPass,
            accountType,
            approved:approved,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,

        });

        //return response
        return res.status(200).json({
            success:true,
            message:"user is registered successfully",
            user,
        })

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message: "User can not be registered. Please try again",
        });        
    }
}


//login
exports.login = async (req, res) => {
    try{
        //get data from req body
        const {email, password} = req.body;
        //validation
        if(!email || !password) {
            return res.status(403).json({
                success:false,
                message:"All fields are required, please fill properly",
            });
        }

        //user check exist or not
        const user = await User.findOne({email});
        if(!user) {
            return res.status(401).json({
                success:false,
                message:"User is not registered, please go to signup page",
            });
        }
        //password match
        if(await bcrypt.compare(password, user.password)) {
            //create token
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"2h",
            });
            user.token = token;
            user.password = undefined;

            //create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:"logged in successfully",
            })
        }

        //password dont match
        else {
            return res.status(401).json({
                success:false,
                message:"password is incorrect",
            });
        }


    }catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login Failure, please try again later",
        });
        
    }
}

//change password
exports.changePassword = async (req, res) => {
    //get data from req body
    // get old pass, new pass, confirm new pass
    //validate
    //hash pass
    //update pass in db
    //send mail- pass updated
    //return response

    try{
        // Get user data from req.user
		const userDetails = await User.findById(req.user.id);

        //get data from req body (old pass, new pass, confirm new pass)
        const { oldPassword, newPassword, confirmNwePassword} = req.body;
        const {email } = req.user.email;

        //validate
        // Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if(oldPassword === newPassword){
			return res.status(400).json({
				success: false,
				message: "New Password cannot be same as Old Password",
			});
		}
		
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}


        if(newPassword !== confirmNwePassword) {
            return res.status(401).json({
                success:false,
                message:"New Passwords dont match, please check the entered new passwords",
            });
        }        

        //update pass in db
        const user = User.findOne({email:email});
        if(await bcrypt.compare( oldPassword, user.password)) {

            //hash the password
            const hashedNewPass = await bcrypt.hash(newPassword, 10);

            //update password in db
            const updatedPass = User.findOneAndUpdate({email:email}, 
                                                {password:hashedNewPass},
                                                {new:true}
            )
        }

        //wrong pass
        else {
            return res.status(403).json({
                success:false,
                message:"Entered password is incorrect, please check it and try again"
            })
        }
        
        //send mail- pass updated
        await mailSender(email, "StudyNotion - Password Updated", 
                passwordUpdated(email, updatedPass.firstName),
        )
        //return response
        res.status(200).json({
            success:true,
            message:"Password changed successfully"
        })


    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:true,
            message:"Error occured while changinng the password"
        })
        
    }
}