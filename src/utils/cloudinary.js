import {v2 as cloudinary} from 'cloudinary';
import exp from 'constants';
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
        console.log("file uploaded successfully",response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) //removed the local saved file as the upload operations fails
        return null
    }
}

export {cloudinary}