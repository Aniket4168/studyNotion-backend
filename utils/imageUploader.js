const cloudinary = require("cloudinary").v2;

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {

        // this will compress the image or video, as per requirement, and then upload it to cloudinary
            const options = {folder};

            if(height) {
                options.height = height;
            }
            if(quality) {
                options.quality = quality;
            }
            options.resource_type = "auto";

            return await cloudinary.uploader.upload(file.tempFilePath, options);


}