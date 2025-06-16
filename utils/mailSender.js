const nodeMailer = require("nodemailer");
require("dotenv").config();


//this is the function to send mail
//now we will use this at multiple places, so it now acting as a utility function
//hence it is in the utility folder
const mailSender = async (email, title, body) => {
    try{
        let transporter = nodeMailer.createTransport({
            host: process.env.MAIL_HOST,
            auth:{
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        })

        let info = await transporter.sendMail({
            from: "StudyNotion - By Aniket Agrawal",
            to: `${email}`,
            subject: `${title}`,
            html :`${body}`,            
        })
        console.log(info);
        return info;
    }
    catch(error) {
        console.log(error.message);
        return error;
    }
}

module.exports = mailSender;