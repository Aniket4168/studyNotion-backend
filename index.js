const express= require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const PORT = process.env.PORT;

//database connect
database.connectDb();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors ({
    origin: "http://localhost:3000",
    credentials: true,
}));

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp",
    })
);

//cloudinary connect
cloudinaryConnect();

//routes mounting
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
// app.use("/api/v1/payment", paymentRoutes);

//default route
app.get("/", (req, res) => {
    return res.json({
        success:true,
        message:"Your server is started and running"
    });
});

//activate the server
app.listen(PORT, ()=> {
    try {
        console.log(`App is running at port: ${PORT}`);
    }
    catch(error) {
        console.log(error);
        
    }
});