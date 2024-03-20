import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";

//token generation method which is used in login 
// const generateAccessAndRefreshToken = async(userId)=>{
//     try {
//         const user = await User.findById(userId)
//         const accessToken = user.generateAccessToken()
//         const refreshToken = user.generateRefreshToken()

//         user.refreshToken = refreshToken
//         await user.save({validateBeforSave: false})

//         return({accessToken,refreshToken})

//     } catch (error) {
//         throw new ApiError(500,"something went wrong while generating access and refresh token")
//     }
// }

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

//login of the user
// const loginUser = asyncHandler(async(req,res)=>{
//     //step for user login
//     // 1. req data from body
//     // 2. username or email
//     // 3. find user
//     // 4. password check
//     // 5. access and refresh token
//     // 6. send cookie

//     // step1 & 2

//     const {username,password,email} = req.body

//     if (!username && !email) {
//         throw new ApiError(400,"Username or email is required")
//     }
//     //step 3
//     const user = await User.findOne({
//         //this is provide either username or email which is first come
//         $or: [{username},{email}]
//     })

//     if (user) {
//         throw new ApiError(404,"User does not exits")
//     }

//     //step 4
//     const isPasswordValid = await user.isPasswordCorrect(password)
//     if (!isPasswordValid) {
//         throw new ApiError(400, "Incorrect password")
//     }

//     //step 5
//     const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

//     const loggedInUser = User.findById(user._id).select("-password -refreshToken")
//     //this will be only updated throw server side only
//     const Option={
//         httpOnly: true,
//         secure: true
//     }

//     //for cookie send step 6
//     return res.status(200)
//     .cookie("accessToken",accessToken,Option)
//     .cookie("refreshToken",refreshToken,Option)
//     .json(
//         new ApiResponse(200,
//             {
//                 user: accessToken,refreshToken,loggedInUser
//             },
//             "user logIn Successfully"
//             )
//     )
// })

//for the logged out of the user
// const loggedOut = asyncHandler(async(req,res)=>{
//     //for loggedOut we need a middleware which is define in auth
//     await User.findByIdAndUpdate(req.user._id,{
//         //this will make refresh token invalid
//         $set:{
//             refreshToken: undefined
//         }
//         },
//         {
//             new: true
//         }
//     )
//     const Option={
//         httpOnly: true,
//         secure: true
//     }

//     return res.status(200)
//     .clearCookie("accessToken", Option)
//     .clearCookie("refreshToken",Option)
//     .json(new ApiResponse(200,{},"User Logged Out succesfully"))
// })

export {registerUser}
