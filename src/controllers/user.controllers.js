import mongoose from "mongoose";
import {
  generateAccessToken,
  generateRefreshToken,
  uploadImageToCloudinary,
} from "../methods/Methods.js";
import userSchema from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { transporter } from "../configs/nodemailer.configs.js";

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });
  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });

  const ifExistingUser = await userSchema.findOne({ email });
  if (ifExistingUser)
    return res.status(400).json({ message: "User already exists" });
  const newUser = await userSchema.create({
    username: name,
    email: email,
    password: password,
  });
  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const info = await transporter.sendMail({
    from: `"Ecommerce Store Team 👻" <${process.env.MY_EMAIL_ADDRESS}>`,
    to: `${email}`,
    subject: "Welcoming Note for Ecommerce Store",
    html: `
    <h3>Dear ${name},</h3>
      <p>Thank you for registering with <strong>Ecommerce Store</strong>!</p>
      <p>If you need further assistance, feel free to reach out to us at mohammadshahzaib046@gmail.com.</p>
      <br>
      <p>Welcome to the community,</p>
      <p>The <strong>Ecommerce Store</strong> Team</p>,
  `,
  });

  res.status(201).json({
    message: "User created successfully",
    data: newUser,
    ACCESS_TOKEN: accessToken,
    REFRESH_TOKEN: refreshToken,
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });

  const user = await userSchema.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword)
    return res.status(400).json({ message: "Invalid password" });
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    message: "User logged in successfully",
    data: user,
    ACCESS_TOKEN: accessToken,
    REFRESH_TOKEN: refreshToken,
  });
};

const getSingleUser = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid ID" });
  const user = await userSchema.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json({
    message: "User found",
    data: user,
  });
};

const logOutUser = async (req, res) => {
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "User logged out successfully" });
};

const uploadImageToDB = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid ID" });
  if (!req.file) return res.status(400).send({ message: "Image is required" });
  const image = req.file.path;
  if (!image) return res.status(400).send({ message: "Image is required" });
  try {
    const response = await uploadImageToCloudinary(image);
    const user = await userSchema.findByIdAndUpdate(id, {
      profilePicture: response,
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({
      message: "Image uploaded successfully",
      data: user,
      url: response,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error occured while uploading image to database" });
  }
};
// refreh access token
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      return res.status(400).json({
        message: "Refresh token is required",
      });

    const isValidRefrehToken = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET
    );
    if (!isValidRefrehToken)
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    const user = await userSchema.findOne({
      email: isValidRefrehToken.email,
    });
    if (!user)
      return res.status(404).json({
        message: "No account found",
      });

    const accessToken = generateAccessToken(user);
    return res.status(200).json({
      message: "Access token refreshed",
      ACCESS_TOKEN: accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while refreshing token",
      error: error.message,
    });
  }
};

export {
  registerUser,
  loginUser,
  getSingleUser,
  logOutUser,
  uploadImageToDB,
  refreshAccessToken,
  sentVerificationCode,
};
