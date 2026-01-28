import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

// export const verifyJWT = asyncHandler(async(req,res,next) => {
//    try {
//     const token = req.cookies?.accessToken || req.header 
//      ("Authorization")?.replace("Bearer ", "")
//      if(!token){
//          throw new ApiError (401,"Unauthorized , no token provided")
//      }
//      try{
//          const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRECT)  
//          req.user = decoded
//          next()
//      }catch(error){
//          throw new ApiError (401,"Unauthorized , invalid token")
//      }

//      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRECT)
//      const user = await User.findById(decodedToken?._id).select(
//          "-password -refreshToken"
//      )

//      if(!user) {
//          throw new ApiError(401,"Unauthorized, user not found")
//      }

//      req.user = user;
//      next()
//    } catch (error) {
//         throw new ApiError(401, eror?.message || "Invalid access token")   
//    }
// })


export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decoded?._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  req.user = user;
  next();
});
