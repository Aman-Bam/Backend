import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access tokens "
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // -------------------- BODY DATA --------------------
    const { fullname, email, username, password } = req.body;

    // -------------------- VALIDATION --------------------
    if (!fullname || !email || !username || !password) {
        throw new ApiError(400, "All fields are required");
    }

    if (
        [fullname, email, username, password].some(
            (field) => field.trim() === ""
        )
    ) {
        throw new ApiError(400, "Fields cannot be empty");
    }

    // -------------------- CHECK EXISTING USER --------------------
    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existingUser) {
        throw new ApiError(
            409,
            "User already exists with this email or username"
        );
    }

    // -------------------- MULTER FILES --------------------
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    // -------------------- CLOUDINARY UPLOAD --------------------
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath)
        : null;

    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar image");
    }

    // -------------------- CREATE USER --------------------
    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    // -------------------- REMOVE SENSITIVE FIELDS --------------------
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "User registration failed");
    }

    // -------------------- RESPONSE --------------------
    return res
        .status(201)
        .json(
            new ApiResponce(201, createdUser, "User registered successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // ---------------- VALIDATION ----------------
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // ---------------- FIND USER ----------------
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // ---------------- CHECK PASSWORD ----------------
    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    // ---------------- GENERATE TOKENS ----------------
    // const accessToken = user.generateAccessToken();
    // const refreshToken = user.generateRefreshToken();

    // user.refreshToken = refreshToken;
    // await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    // ---------------- REMOVE SENSITIVE FIELDS ----------------
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // ---------------- SET COOKIES ----------------
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponce(200, loggedInUser, "User logged in successfully")
        );
});

const logotUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined },
        },
        {
            new: true,
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponce(200, {}, "User logged out "))
});

export { registerUser, loginUser, logotUser };
