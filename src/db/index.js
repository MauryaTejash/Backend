import mongoose, { connect } from "mongoose";
import { DB_MAME } from "../constants.js";
const connectDB = async() =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_MAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
        // console.log(connectionInstance);
    } catch (error) {
        console.log("MongoDb connection Error",error);
        process.exit(1)
    }
}

export default connectDB