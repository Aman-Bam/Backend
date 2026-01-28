import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
    verifyRefreshToken,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// ---------------- REGISTER ----------------
router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);

// ---------------- LOGIN ----------------
router.route("/login").post(loginUser);

// ---------------- LOGOUT (secure) ----------------
router.route("/logout").post(verifyJWT, logoutUser);

// ---------------- REFRESH TOKEN ----------------
router.route("/refresh-token").post(refreshToken);

// ---------------- VERIFY REFRESH TOKEN ----------------
router.route("/verify-refresh-token").post(verifyRefreshToken);

export default router;
