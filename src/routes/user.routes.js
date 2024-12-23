import express from "express";
import {
  getSingleUser,
  loginUser,
  logOutUser,
  registerUser,
  uploadImageToDB,
} from "../controllers/user.controllers.js";
import { authenticateUser } from "../middlewares/authentication.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/:id", getSingleUser);
router.post("/uploadImage/:id", authenticateUser, uploadImageToDB);
router.post("/logout", logOutUser);

export default router;
