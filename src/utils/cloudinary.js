import {v2 as cloudinary} from 'cloudinary';
import { log } from 'console';
import fs from 'fs'

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null
        //uploading file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file uploaded
        // console.log("file uploaded successfully",response.url);

        //this will unlink the file when it successfully uploaded on temp folder
        fs.unlinkSync(localFilePath)
        // console.log(response);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) //removed the local saved file as the upload operations fails
        return null
    }
}

export {uploadOnCloudinary}