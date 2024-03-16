// require('dotenv').config({path:'./env'})   this is one method to env variable 
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import express from 'express'
const app = express()
dotenv.config({
    path:'./env'
})

//second method to connect with the DATABASE

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("Mongo Error to connect!!! ", error)
})
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