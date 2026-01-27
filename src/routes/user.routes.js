import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router()

// Example route: Get user profile
router.route("/register").post(registerUser)


export default router