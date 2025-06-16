const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const otpTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires: 5*60*10000*100,
    }
});

//now sending and verifying otp is a pre middleware
//as pehle otp verify hoga, then db me entry banegi

//hence it is a PRE MIDDLEWARE

async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification email from StudyNotion", otpTemplate(otp));
        console.log("Email sent successfully", mailResponse);        
    }
    catch(error) {
        console.log("error occured while sending the email: ", error);
        throw(error);
        
    }
}

OTPSchema.pre("save", async function(next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
})


module.exports = mongoose.model("OTP", OTPSchema);