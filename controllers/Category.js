const Category = require("../models/Category");

//create category handler function
exports.createCategory = async (req, res) => {
    try{
        //fetch data
            const {name , description} = req.body;

        //validate
            if(!name || !description) {
                return res.status(400).json({
                    success:false,
                    message:"All fields are required to make a Category",
                })
            }

        //create entry in DB
            const categoryDetails = await Category.create({
                name:name,
                description:description,
            });
            console.log(categoryDetails);

        //return response 
            return res.status(200).json({
                success:true,
                message:"Category created successfully",
            })
            

    } catch(error) {
        return res.status(500).json({
            success:false,
            message: error.message,
        });
    }
}

//get all categories

exports.showAllCategory = async (req, res) => {
    try{
        //fetch all categories, there is no searching criteria
        //but we make sure that each entry contains name and description
            const allCategory = await Category.find({}, {name:true, description:true});
            res.status(200).json({
                success:true,
                message:"All categories are fetched successfully",
                allCategory,
            });

    } catch(error) {
        return res.status(500).json({
            success:false,
            message: error.message,
        });
    }
} 