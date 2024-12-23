import express from "express";
import {
  getSingleUser,
  loginUser,
  logOutUser,
  registerUser,
  uploadImageToDB,
} from "../controllers/user.controllers.js";
import { authenticateUser } from "../middlewares/authentication.middleware.js";
import { upload } from "../middlewares/multer.middlerware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:id", getSingleUser);
router.post("/uploadImage/:id", upload.single("image"), uploadImageToDB);
router.post("/logout", logOutUser);

export default router;
