import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";

//registration of the user 
const registerUser = asyncHandler(async(req,res)=>{
    // res.status(200).json({
    //     message: "Hello Tejash!!!!"
    // })

    //steps used for registration
    // 1.> get user details from frontend
    // 2.> validate - should not empty
    // 3.> check for already existing users : email,username
    // 4.> check for image and avatar
    // 5.> upload it to cloudinary
    // 6.> create the db entry of this
    // 7.> remove pass and refresh token field from response
    // 8.> check for user creation
    // 9.> return response
    const {username, fullname, email, password} = req.body
    // console.log("email:",email);
    // console.log(req.body);

    //validation is performed method-1
    // if (fullname === "") {
    //     throw new ApiError(400,'Fullname is required')
    // }
    // if (username === "") {
    //     throw new ApiError(400,'username is required')
    // }
    // if (email === "") {
    //     throw new ApiError(400,'email is required')
    // }
    // if (password === "") {
    //     throw new ApiError(400,'password is required')
    // }

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //check for existing username and email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    // console.log(req.files);

    //for the avatar and cover image
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
    }

    //upload to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registring the user")
    }

    //returning the response to user
    return res.status(201).json(
        new ApiResponse(200, createdUser,"user registration succesfully")
    )
})
export {registerUser}
