const Category = require("../models/Category");
const Course = require("../models/Course");

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

exports.showAllCategories = async (req, res) => {
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

//category page details
exports.categoryPageDetails = async (req, res) => {
    try{
        //get category id
            const {categoryId} = req.body;

        //get courses for spicified category id
         const selectedCategory = await Category.findById(categoryId)
                                    .populate("courses")
                                    .exec(); 

        //validation
            if(!selectedCategory) {
                return res.status(404).json({
                    success:false,
                    message:"Data not found",
                });
            }

        //get courses for different categories
            const differentCategories = await Category.find({
                                _id: {$ne: categoryId},
                            })
                            .populate("courses")
                            .exec();

        //get top selling courses
            /*CAN ALSO DO IT BY GOING TO DIRECT COURSES SCHEMA
                FETCH ALL COURSES AND THEN SORT THEM ACCORDING TO LENGTH OF studentsEnrolled
                    AND RETURN RESPONSE */
            //get allCategories
            const allCategories = await Category.find({}).populate(
                                        { path:"courses" ,
                                            populate:([{path:"instructor"}, {path:"ratingAndReviews"}]),
                                        });
            //get all courses //store all courses in an array
            const allCourses = allCategories.flatMap((category) => category.course);            
                    
            //sort them according to the length of students enrolled
            const topSellingCourses = allCourses.sort((a,b) => b.studentsEnrolled.length - a.studentsEnrolled.length)
                                                .slice(0,10);
            //return top 10 courses
        //return response
            return res.status(200).json({
                success:true,
                selectedCategory:selectedCategory,
                differentCategories:differentCategories,
                topSellingCourses:topSellingCourses,
            });

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });        
    }
} 

//add course to category
exports.addCourseToCategory = async (req, res) => {
	const { courseId, categoryId } = req.body;
	// console.log("category id", categoryId);
	try {
		const category = await Category.findById(categoryId);
		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found",
			});
		}
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({
				success: false,
				message: "Course not found",
			});
		}
		if(category.course.includes(courseId)){
			return res.status(200).json({
				success: true,
				message: "Course already exists in the category",
			});
		}
		category.course.push(courseId);
		await category.save();
		return res.status(200).json({
			success: true,
			message: "Course added to category successfully",
		});
	}
	catch (error) {
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
}