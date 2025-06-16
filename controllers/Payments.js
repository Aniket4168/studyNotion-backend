const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { mongoose } = require("mongoose");
const { response } = require("express");
const {paymentSuccess} = require("../mail/templates/paymentSuccess");
const crypto = require("crypto");
const CourseProgress = require("../models/CourseProgress");

//capture the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
    
        //get course id and user id
            const {courseId} = req.body;
            const userId = req.user.id;

        //validation
        //valid course ID
            if(!courseId) {
                return res.json({ 
                    success:false,
                    message:"Please provide valid course ID",
                });
            } 

        //valid course details
            let course;
            try{
                course = await Course.findById(courseId);
                if(!course) {
                    return res.json({
                        success:false,
                        message:"Could not find the course",
                    });
                }

                // user already paid for the course
                const uid = new mongoose.Types.ObjectId(userId);
                if(course.studentsEnrolled.includes(uid)) {
                    return res.status(200).json({
                        success:false,
                        message:"User already enrolled for the course"
                    });
                }
            }
            catch(error) {
                console.error(error);
                return res.status(500).json({
                    success:false,
                    message:error.message,
                });
            }
        
        //order create
            const amount = course.price;
            const currency = "INR";

            const options = {
                amount: amount*100,
                currency,
                recipt: Math.random(Date.now()).toString(),
                notes:{
                    courseId: courseId,
                    userId,
                }
            };

            //function call
            try{
                //initiate payment using razorpay
                const paymentResponse = await instance.orders.create(options);
                console.log(paymentResponse);

                //return res
                return res.status(200).json({
                    success:true,
                    courseName: course.courseName,
                    courseDescription : course.courseDescription,
                    thumbnail: course.thumbnail,
                    orderId: paymentResponse.orderId,
                    currency : paymentResponse.currency,
                    amount: paymentResponse.amount,
                });
                
            } catch(error) {
                console.log(error);
                response.json({
                    success:false,
                    message:"Could not initiate order"
                });                
            }
     
} ;

//verification of payment

exports.verifySignature = async (req, res) => {
    const webHookSecret = "12345678";

    //this is the default syntax of signature sent by razorpay
    const signature = req.headers("x-razorpay-signature");

    // a 3 step process to convert web hook to the format of razorpay
    
        //now we will hash our web hook to match it with the upcomming secret key
        const shasum = crypto.createHmac("sha256", webHookSecret);
        //Serialize the request payload to its JSON string form,
        // and feed those bytes into the HMAC calculation.
        shasum.update(JSON.stringify(req.body));
        //we convert it to a hexadecimal string and by convention, it is known as digest
        const digest = shasum.digest("hex");

    //match signature
    if(signature === digest) {
        console.log("payment is Authorized");
        
        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try{
            //fulfill the action
            //find the course and enroll the student in it
                const enrolledCourse = await Course.findOneAndUpdate(
                                                    {_id:courseId},
                                                    {$push: {studentsEnrolled:userId}},
                                                    {new:true},
                                                   );
                if(!enrolledCourse) {
                    return res.status(500).json({
                        success:false,
                        message:"Course not found",
                    });
                }

                console.log(enrolledCourse);

            //find studnet and update the course in his Schema
                const enrolledStudent = await User.findOneAndUpdate(
                                                    {_id:userId},
                                                    {$push: {courses:courseId}},
                                                    {new:true},
                                            );
                console.log(enrolledStudent);

            //send the confirmation email
                const emailResponse = await mailSender(
                                        enrolledStudent.email,
                                        "Congratualtions",
                                        "Congratulations, you are onboarded into new Aniwal course",
                                    );  
                console.log(emailResponse);
                return res.status(200).json({
                    success:true,
                    message:"Signature Verified and Student enrolled in the course",
                });
                                      

                
        } catch(error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message: error.message,
            });
        }
    }
    else {
        return res.status(400).json({
            success:false,
            message:"Invalid request",
        });
    }
}