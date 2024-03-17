import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

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
// router.route("/login").post(login)

export default router