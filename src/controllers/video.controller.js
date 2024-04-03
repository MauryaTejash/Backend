import mongoose,{isValidObjectId} from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req,res)=>{
        const { page = 1, limit = 10, query, userId } = req.query;
        if (page < 1 && limit >10) {
            throw new ApiError(404,"Invalid page or limit")
        }

        if (!query && !query?.trim()) {
            throw new ApiError(400,"define query?")
        }

        if (!isValidObjectId(userId)) {
            throw new ApiError(400,"invalid userId")
        }

        //finding the user from DB
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404,"User not found")
        }

        // defining search criteria
    const searchCriteria = {};
    if (sortBy && sortType) {
        searchCriteria[sortBy] = sortType === "asc" ? 1 : -1;   //assigning the search criteria
    } else {
        searchCriteria["createdAt"] = -1; 
    }

    // defining options for aggregate paginate 
    const options = {
        page : parseInt(page, 10),
        limit : parseInt(limit, 10),
        sort: searchCriteria
    };

    //aggregation
    const videoAggregation = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(user)
            }
        },
        {
            $match:{
                //matching of title we have used the regex
                title: { 
                    $regex: query
                }
            }
        },
    ])

    const videos = await Video.aggregatePaginate(
        videoAggregation,
        options,
    );
    if(videos.totalDocs === 0)
    {
        throw new ApiError(400,"no video found in search query")
    }

    return res.status(200)
    .json(new ApiResponse(200,videos,"video fetched succefully"))
    });


    export const publishAVideo = asyncHandler(async (req, res) => {
        // TODO: get video, upload to cloudinary, create video
    
        // taking title and description from the user
        const { title, description } = req.body;
        
        if (title === "") {
            throw new ApiError(400, "title is required.")
        }
    
        if (description === "") {
            throw new ApiError(400, "description is required.")
        }
    
        // taking the video path and checking its validation
        let videoFileLocalPath;
        if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
            videoFileLocalPath = req.files?.videoFile[0].path;
        }
    
        if (!videoFileLocalPath) {
            throw new ApiError(400, "Video file not found.")
        }
    
        let thumbnailLocalPath;
        if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
            thumbnailLocalPath = req.files.thumbnail[0].path;
        }
    
        if (!thumbnailLocalPath) {
            throw new ApiError(400, "Thumbnail file not found.")
        }
    
        // uploading the video & thumbnail to cloudinary
        const videoPublished = await uploadOnCloudinary(videoFileLocalPath);
    
        if(!videoPublished){
            throw new ApiError(400, "Video is required");
        }
    
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    
        if(!thumbnail){
            throw new ApiError(400, "Video is required");
        }
    
        // saving the video & its details to DB
        const video = await Video.create({
            title,
            description,
            videoFile: {url: videoPublished.url, public_id: videoPublished.public_id},
            thumbnail: {url: thumbnail.url, public_id: thumbnail.public_id},
            duration: videoPublished.duration,
            owner: req.user?._id,    // as user is already logged in if he is uploading a video
        });
    
        if(!video){
            throw new ApiError(200, "Something went wrong while uploading video.");
        }
    
        // returning response
        return res
        .status(200)
        .json(new ApiResponse(200, video, "Video uploaded successfully."));
    
    });

export {
    getAllVideos,
    publishAVideo
}