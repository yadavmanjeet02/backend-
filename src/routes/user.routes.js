import { Router } from "express";
import { changecurrentPassword, getCurrentUser, loginUser, logoutUser, refreshaccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1

        },
        {
            name:"coverimage",
            maxCount:1

        }
    ]),

    registerUser
)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshaccessToken)
router.route("/change-password").post(verifyJWT,changecurrentPassword);

router.route("/current-user").get(verifyJWT,getCurrentUser);

router.route("/update-account").patch(verifyJWT,updateAccountDetails);

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);

router.route("/cover-image").patch(verifyJWT,upload.single("coverimage"),updateUserCoverImage);

export default router