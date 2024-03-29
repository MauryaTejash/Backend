import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import  jwt from "jsonwebtoken";
import mongoose from "mongoose";

//token generation method which is used in login 
const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

//registration of the user 
const registerUser = asyncHandler(async(req,res)=>{
//     res.status(200).json({
//         message: "Hello Tejash!!!!"
//     })
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

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
//     console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
//     console.log(avatarLocalPath);

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )

// login of the user
const loginUser = asyncHandler(async(req,res)=>{
    //step for user login
    // 1. req data from body
    // 2. username or email
    // 3. find user
    // 4. password check
    // 5. access and refresh token
    // 6. send cookie

    // step1 & 2

    const {username,password,email} = req.body

    if (!username && !email) {
        throw new ApiError(400,"Username or email is required")
    }
    //step 3
    const user = await User.findOne({
        //this is provide either username or email which is first come
        $or: [{username},{email}]
    })

    if (!user) {
        throw new ApiError(404,"User does not exits")
    }

    //step 4
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(400, "Incorrect password")
    }
    
    //step 5
    const {accessToken,refreshToken} = await generateAccessAndRefereshTokens(user._id)
 

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    //this will be only updated throw server side only
    const options={
        httpOnly: true,
        secure: true
    }

    //for cookie send step 6
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,
                // accessToken,
                // refreshToken
            },
            "User logged In Successfully"
        )
    )
})

//for the logged out of the user
const loggedOut = asyncHandler(async(req,res)=>{
    //for loggedOut we need a middleware which is define in auth
    await User.findByIdAndUpdate(req.user._id,{
        //this will make refresh token invalid
        $unset:{
            refreshToken: 1
        }
        },
        {
            new: true
        }
    )
    const options={
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out succesfully"))
})

//for the generation of new access and refresh token endpoint

const refereshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401,"Unauthorized access")
    }
    //verification of user token and DB token
    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401,"Invalid refresh token")
        }
    
        //matching of user token and decoded token from DB 
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401,"Refresh token is expire or used")
        }
    
        //generation of new access and refresh token
        const options={
            httpOnly: true,
            secure: true,
        }
    
        const {newrefreshToken,accessToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newrefreshToken
                },
                "AccessToken refresh succesfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

//for the password updation or change

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "invalid old password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200)
    .json(new ApiResponse(200,{},"Password change succefully"))
})

//for getting the current user with the help of middleware
const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(new ApiResponse(205,req.user,"current user fetched succefully"))
})

//for updation in account details
const updateAccountDetail = asyncHandler(async(req, res)=>{
    const {fullname,email} = req.body
    if (!fullname || !email) {
        throw new ApiError(401,"Fullname and Email required")
    }
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            //updation or set of updated field value
            $set:{
                fullname:fullname,
                email: email
            }
        },
        {
            new: true
        }
        )
        .select("-password")

        return res.status(200)
        .json(new ApiResponse(200,user,"account update succesfully!!!"))
})

//for the updation of avatar file 
const updateUserAvatar = asyncHandler(async(req, res)=>{
    //to select the path of avatar
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400,"Error while uploading the avatar file")
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            //this will update or set the new value of avatar
            $set:{
                avatar: avatar.url
            }
        },
        {
            new: true
        }
        //not selecting the password 
        ).select("-password")
        
        return res.status(200)
        .json(new ApiResponse(200,user,"avatar updated succesfully"))
})

//for the updation of coverImage
const updateUserCoverImage = asyncHandler(async(req, res)=>{
    const coverImagePath = req.file?.path

    if (!coverImagePath) {
        throw new ApiError(400,"coverImage file is missing")
    }
    const coverImage = await uploadOnCloudinary(coverImagePath)
    if (!coverImage.url) {
        throw new ApiError(400,"Error while updating coverImage")
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            //this will update or set the new value of coverImage
            $set:{
                coverImage: coverImage.url
            }
        },
        {
            new: true
        })
        .select("-password")
    
        return res.status(200)
        .json(new ApiResponse(200,user,"coverImage updated succesfully"))
})

//for getting the details of subscriber and subscribed
const getUserChannelProfile = asyncHandler(async(req, res)=>{
    const {username} = req.params
    if (!username?.trim()) {
        throw new ApiError(400,"username is missing")
    }

    //to find the channel using match aggregate
    const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            //this lookup is for subscribed field of that channel
            $lookup:{
                from: "subscriptions",   //from which model it will look
                localField: "_id",  //from which field it will look
                foreignField: "channel", //from where it will present i.e destination field
                as: "subscribers" //name given to it
            }
        },
        {
            //this lookup is for subscribe to whome you are subscribe
            $lookup:{
                from: "subscriptions",   //from which model it will look
                localField: "_id",  //from which field it will look
                foreignField: "subscriber", //from where it will present i.e destination field
                as: "subscribedTo" //name given to it
            }
        },
        {
            //for the count of subscriber and subscribed
            $addFields:{
                subscriberCount:{
                    $size:"$subscribers"
                },
                channelSubscribeToCount:{
                    $size: "$subscribedTo"
                },
                //this is for the button which shows you are subscribed or not
                isSubscribed:{
                    $cond:{
                        if: {$in: [req.user?._id,"$subscribers.subscriber"]}, //$in work in both, array and object
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            //this will provide the value on the frontend profile of user
            $project:{
                fullname: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                channelSubscribeToCount: 1,
                isSubscribed: 1,
                username: 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404,"channel does not exists")
    }

    return res.status(200)
    .json(new ApiResponse(200,channel[0],"channel fetched succesfully"))
})

//for getting the watchHistory of user
const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                //this pipeline give the owner watchHistory
                pipeline:[{
                    $lookup:{
                        from: "users",
                        localField:"owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline:[{
                            $project:{
                                fullname: 1,
                                avatar: 1,
                                username: 1
                            }
                        }]
                    }
                }],
            }
        },
        {
            $addFields:{
                owner:{
                    $first: "$owner"
                }
            }
        }
    ])

    return res.status(200)
    .json(new ApiResponse(200, user[0].watchHistory,"WatchHistory fetched succefully"))
})
export {
    registerUser,
    loginUser,
    loggedOut,
    refereshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetail,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}
