//this will take the user's data
//and send a mail to user that his query is received
//and send a mail to us giving us the user details about contact

const mailSender = require("../utils/mailSender");
require("dotenv").config();

exports.contactUs = async (req, res) => {
    try{
        //fetch data
            const {firstName, lastName, email, phoneNo, message} = req.body;

        //validate the data
            if(!firstName || !lastName || !email || !phoneNo || !message) {
                return res.status(400).json({
                    success:false,
                    message:"All fields are mandaatory to fill",
                });
            }
        
        //send mail to the user
            const userMail = await mailSender(email, "Query received",
                            `<h2> Hi ${firstName}, welcome to StudyNotion </h2>
                            <we have received your query request, our team will reach out to you shortly</p>`
            );
        
            if(!userMail) {
                return res.json({
                    success:false,
                    message:"Something went wrong while sending mail to User"
                });
            }

        //send mail to Admin
            const data = {
            firstName,
            lastName,
            email,
            message,
            phoneNo,
            };

            const adminMail = await mailSender(process.env.ADMIN_MAIL ,
                                "Contact query received", 
                                `<html><body>${Object.keys(data).map((key) => {
                                return `<p>${key} : ${data[key]}</p>`;
                                })}</body></html>`

            )
            if(!adminMail) {
                return res.json({
                    success:false,
                    message:"Something went wrong while sending mail to Admin"
                });
            }

        //return response
            return res.status(200).json({
                success:true,
                message:"Mail sent successfully to user and admin"
            });

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while contacting us"
        });        
    }
}