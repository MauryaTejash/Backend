// require('dotenv').config({path:'./env'})   this is one method to env variable 
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})

//second method to connect with the DATABASE

connectDB()

// first method to connect with the DATABASE

// (async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_MAME}`)
//         //if database is not able to connect
//         app.on("Error:",()=>{
//             console.log("Error: ",error);
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`Running at port ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.error("Error",error);
//         throw err
//     }
// })()