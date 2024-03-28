import { Router } from "express";
import {changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loggedOut, loginUser, refereshAccessToken, registerUser, updateAccountDetail, updateUserAvatar, updateUserCoverImage} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

//router for the registering the user
const router = Router()
router.route("/register").post(
    //this is middleware which is used just before the registration of user for images
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser
    )

//router for the logging of the user
router.route("/login").post(loginUser)

//secure routes for loggedout
router.route("/logout").post(verifyJWT,loggedOut)

router.route('/refresh-token').post(refereshAccessToken)

router.route('/change-password').post(verifyJWT,changeCurrentPassword)

router.route('/current-user').get(verifyJWT,getCurrentUser)

router.route('/update-account').patch(verifyJWT,updateAccountDetail)

router.route('/avatar').patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route('/cover-image').patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route('/history').get(verifyJWT,getWatchHistory)


export default router