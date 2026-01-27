import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/index.js";
import app from "./app.js";


connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
      console.log(`http://localhost:${process.env.PORT}`)
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });












// ( async () => {
//      try {
//         await mongoose.connect(`${process.env.
//             MONGODB_URI}/${DB_NAME}`)
//             app.on("error", (error) => {
//                 console.log("ERROR: ",error);
//                 throw error
//             })

//             app.listen(process.env.PORT, () => {
//                 console.log(`app is listening on port ${process.env.PORT}`);
//             })

//      } catch (error) {
//         console.error("ERROR: ",error)
//         throw err 
//      }
// })