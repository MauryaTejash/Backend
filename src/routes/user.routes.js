import { Router } from "express";
import {loggedOut, loginUser, refereshAccessToken, registerUser} from "../controllers/user.controller.js";
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

export default router