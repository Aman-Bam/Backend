import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";

// const registerUser = asyncHandler(async (req, res) => {
//     // get user details from frontend
//     // validation - not empty
//     // check user exist : username , email
//     // check img , for avatar
//     // upload to cloudinary
//     // create user obj , create entry in db
//     // remove pass & refresh token field from response
//     // check for user creation
//     // return res

//     const { fullname, email, username, password } = req.body;
//     console.log("email: ", email);

//     router.post(
//         "/register",
//         upload.fields([
//             { name: "avatar", maxCount: 1 },
//             { name: "coverImage", maxCount: 1 },
//         ]),
//         registerUser
//     );

//     if (
//         [fullname, email, username, password].some((field) =>
//             field?.trim() === "" || field === undefined
//         )
//     ) {
//         throw new ApiError(400, "All fields are required");
//     }
//     // check if user already exists
//     const existingUser = await User.findOne({
//         $or: [{ email }, { username }],
//     })
//     if (existingUser) {
//         throw new ApiError(409, "User already exists with this email or username");
//     }

//     const avatarLocalpath = req.files?.avatar?.[0]?.path;
//     const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

//     if (!avatarLocalpath) {
//         throw new ApiError(400, "Avatar image is required");
//     }

//     const avatar = await uploadOnCloudinary(avatarLocalpath)
//     const coverImage = await uploadOnCloudinary(coverImageLocalPath)

//     if (!avatar) {
//         throw new ApiError(500, "Could not upload avatar image, please try again");
//     }

//     const user = await User.create({
//         fullname,
//         avatar: avatar.url,
//         coverImage: coverImage?.url || "",
//         email,
//         username: username.toLowerCase(),
//         password,
//     })
//     const createdUser = await User.findById(user._id).select(
//         "-password -refreshToken"
//     )
//     if (!createdUser) {
//         throw new ApiError(500, "User registration failed, please try again");
//     }

//     return res.status(201).json(
//         new ApiResponce(200, createdUser, "User registered successfully")
//     )
// });

// export { registerUser };






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
  return res.status(201).json(
    new ApiResponce(201, createdUser, "User registered successfully")
  );
});

export { registerUser };