const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const Course = require("../models/Course");
require("dotenv");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//create subsection
exports.createSubSection = async (req, res) => {
    try{ 
        //fetch details from req body
            const {sectionId, title, timeDuration, description} = req.body;

        //extract file/video
            const video = req.files.videoFile;

        //validation
            if(!sectionId || !title || !timeDuration || !description ||!video) {
                return res.status(400).json({
                    success:false,
                    message:"All fields are required",
                });
            }

        //upload video to cloudinary and fetch secure url
            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            console.log(uploadDetails);

            
                   

        //create a sub section
            const subSectionDetails = await SubSection.create({
                title:title,
                timeDuration:timeDuration,
                description:description,
                videoUrl:uploadDetails.secure_url,
            });

        //update the subSection Objectid in section
            const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                                                {
                                                    $push:{
                                                        subSection:subSectionDetails._id,
                                                    },
                                                },
                                                {new:true}).populate("subSection").exec();
        //return response
            return res.status(200).json({
                success:true,
                message:"SubSection created Successfully",
                updatedSection,
            });

    } catch(error) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong while creating SubSection",
            error:error.message
        });
    }
}

//update subSection

exports.updateSubSection = async (req, res) => {
    try{
        //fetch details
            const{ subSectionId, title, timeDuration, description} = req.body;
            const video = req?.files?.videoFile;
        //validate
            if(!title || !timeDuration || !description || !subSectionId) {
                return res.status(401).json({
                    success:true,
                    message:"Please fill all the details carefully",
                });
            }
        
        //upload video
            let uploadDetails = null;
            // Upload the video file to Cloudinary
            if(video){
                uploadDetails = await uploadImageToCloudinary(
                    video,
                    process.env.FOLDER_VIDEO
                );
            }    

        //update details

            const subSectionDetails = await SubSection.findByIdAndUpdate(subSectionId, 
                                            {
                                                title:title,
                                                timeDuration:timeDuration,
                                                description:description,
                                                ideoUrl: uploadDetails?.secure_url || SubSection.videoUrl,
                                            },
                                            {new:true});
        
        //return response
                return res.status(200).json({
                    success:false,
                    message:"sub-section details updated successfully",
                    subSectionDetails,
                });                            


    } catch(error) {
        return res.status(500).json({
            success:true,
            message:"Something went wrong while updating the subSection",
        });
    }
}

//delete SubSection

exports.deleteSubSection = async (req, res) => {
    try{
        //fetch details, //get id assuming that we are sending id in params
            const {subSectionId} = req.params;

    

        //first update the section schema
            await Section.findByIdAndDelete({subSection: subSectionId});

        //now delete the subsection
            await SubSection.findByIdAndDelete(subSectionId);

        //return res
            return res.status(200).json({
                success:true,
                message:"sub section deleted successfully",
            });

    } catch(error) {
        return res.status(500).json({
            success:true,
            message:"Something went wrong while updating the subSection",
            error:error
        });
    }
}