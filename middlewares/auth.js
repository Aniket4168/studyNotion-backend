const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth middleware
exports.auth = async (req, res ,next) => {
    try{
        //extract token
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ","");

        //if the token is missing
        if(!token) {
            return res.status(401).json({
                success:false,
                message: "Token is missing",
            });
        }

        //verify the token
        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode); 
            req.user = decode;
        }
        catch(error) {
            //verification me issue
            return res.status(401).json({
                success:false,
                message: "Token is invalid"
            });
        }
        next();
    

    } catch(error) {
        return res.status(401).json({
            success:false,
            message:"something went wrong while validatiing the token",
        });
    }
}


//is student
exports.isStudent = async (req, res, next) => {
    try {
        //verify karne le liye, 
        //user ka role(account type bas check karna hai, thats it)
        //ye karne ke 2 ways
        //ya to token ke payload me hamne role mention kiya hai, wha se karlo
        // ya db se data fetch karke wha se verify karlo

        if(req.user.accountType !== "Student") {
            return res.status(401).json({
                success:false,
                message:"this is a protected route for studnent only"
            });
        } 
        next();        

    } catch(error) {
        return res.status(500).json({
            success:false,
            message:"student verification failed"
        })
    }
}

//is instructor
exports.isInstructor = async (req, res, next) => {
    try {
        //verify karne le liye, 
        //user ka role(account type bas check karna hai, thats it)
        //ye karne ke 2 ways
        //ya to token ke payload me hamne role mention kiya hai, wha se karlo
        // ya db se data fetch karke wha se verify karlo

        if(req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success:false,
                message:"this is a protected route for instructor only"
            });
        } 
        next();        

    } catch(error) {
        return res.status(500).json({
            success:false,
            message:"instructor verification failed"
        })
    }
}

//is Admin
exports.isAdmin = async (req, res, next) => {
    try {
        //verify karne le liye, 
        //user ka role(account type bas check karna hai, thats it)
        //ye karne ke 2 ways
        //ya to token ke payload me hamne role mention kiya hai, wha se karlo
        // ya db se data fetch karke wha se verify karlo

        console.log();
        
        if(req.user.accountType !== "Admin") {
            return res.status(401).json({
                success:false,
                message:"this is a protected route for Admin only"
            });
        } 
        next();        

    } catch(error) {
        return res.status(500).json({
            success:false,
            message:"Admin verification failed"
        })
    }
}

