import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/user.routes.js";
import { connectDB } from "./src/db/index.js";

const app = express();
dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use("/api/v1/users", userRoutes);

(async () => {
  try {
    const res = await connectDB();
    console.log(res);
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
})();
