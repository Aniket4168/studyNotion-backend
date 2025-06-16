const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//reset password token

exports.resetPasswordToken = async (req, res) => {
    try{
        //get email from user
        //check user for this email, email validation
        //generate token
        //validate user by adding token and expiration time
        //create url
        //send mail containing url
        //return response

        const email = req.body.email;

        //check email and validate
        const user = await User.findOne({email:email});

        if(!user) {
            return res.json({
                success:false,
                message:"your email is not registered with us",
            })
        }

        //generate token
        const token = crypto.randomUUID();

        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({email:email}, 
                                    {
                                        token:token,
                                        resetPasswordExpiration: Date.now() + 5*60*1000,
                                    },
                                    {new:true} //this will return us the most recent document
        )

        //create url
        const url = `http://localhost:3000/update-password/${token}`

        //send mail containig the url
        await mailSender(email, "Password reset Link",
                            `Password Reset Link: ${url}`
        );

        //return response
        return res.json({
            success:true,
            message:"Email sent successfullly, please check email and change password"
        })

    }catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while verifying the token"
        });        
    }    
}

//reset password
exports.resetPassword = async (req, res) => {
    try{
        //fetch data
        //validate
        //get user details from db using token
        //if no entry - invalid token
        // token time check
        //hash password
        //update pass
        //return res


        //fetch data
        const {password, confirmPassword, token} = req.body;

        //validate
        if(password !== confirmPassword) {
            return res.json({
                success:false,
                message:"Passwords are not matching, please check the passwords",
            });
        }
        
        //get user details from db using token
        const userDetails = await User.findOne({token:token});

        //if no entry - invalid token
        if(!userDetails) {
            return res.json({
                success:false,
                message:"Token is invalid",
            });
        }

        // token time check
        if(userDetails.resetPasswordExpiration < Date.now() ) {
            return res.json({
                success:false,
                message:"Token is expired, please try again to reset password"
            })
        }

        //hash password
        const hashedPass = await bcrypt.hash(password, 10);

        //update pass
        await User.findOneAndUpdate({token:token}, 
                            {password:hashedPass}, 
                            {new:true},
        );

        //return res
        return res.status(200).json({
            success:true,
            message:"Password reset successful"
        });
    } catch(error) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong while resetting the password "
        });
    } 
}
