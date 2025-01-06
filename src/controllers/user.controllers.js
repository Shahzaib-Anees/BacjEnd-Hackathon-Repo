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
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });

  const ifExistingUser = await userSchema.findOne({ email });
  if (ifExistingUser)
    return res.status(400).json({ message: "User already exists" });
  const newUser = await userSchema.create({ email, password });
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
    <h3>Dear ${user.username},</h3>
      <p>Thank you for registering with <strong>Ecommerce Store</strong>!</p>
      <p>If you need further assistance, feel free to reach out to us at mohammadshahzaib046@gmail.com.</p>
      <br>
      <p>Welcome to the community,</p>
      <p>The <strong>Ecommerce Store</strong> Team</p>,
  `});

  res.status(201).json({
    message: "User created successfully",
    data: newUser,
    ACCESS_TOKEN: accessToken,
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
  const { refreshToken } = req.cookie;
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
  const user = await schemaForUser.findOne({ email: isValidRefrehToken.email });
  if (!user)
    return res.status(404).json({
      message: "No account found",
    });

  const accessToken = generateAccessToken(user);
  return res.status(200).json({
    message: "Access token refreshed",
    accessToken,
  });
};

// forgot Password
const sentVerificationCode = async (req, res) => {
  const { email, type } = req.body;
  if (!email)
    return res.status(400).json({
      message: "Email is required",
    });

  if (!type)
    return res.status(400).json({
      message: "Type is required",
    });

  const user = await schemaForUser.findOne({ email: email });
  if (!user)
    return res.status(404).json({
      message: "No account found with this email",
    });

  const existingVerificationCode = await schemaForVerify.findOne({
    userId: user._id,
  });

  if (existingVerificationCode) {
    return res.status(400).json({
      message: "Verification code already sent",
    });
  }

  const code = generateCode();
  const codeInDb = await schemaForVerify.create({
    userId: user._id,
    verificationCode: code,
  });

  setTimeout(async () => {
    await schemaForVerify.findOneAndDelete({ _id: codeInDb._id });
  }, 60000);

  // Email Design for Email Verification
  const info = await transporter.sendMail({
    from: `"Ecommerce Store Team 👻" < ${process.env.MY_EMAIL_ADDRESS} > `,
    to: `${email}`,
    subject: "Verify Your Email for ChatBox",
    html: `${type === "email_verification"
      ? `
     <h3>Dear ${user.username},</h3>
      <p>Thank you for registering with <strong>Ecommerce Store</strong>! To complete your registration and activate your account, please enter the verification code provided below:</p>
      <p><strong>Verification Code: ${code}</strong></p>
      <p>This code will expire in <strong>1 minute</strong>. If you did not request this verification, please disregard this email.</p>
      <p>If you need further assistance, feel free to reach out to us at mohammadshahzaib046@gmail.com.</p>
      <br>
      <p>Welcome to the community,</p>
      <p>The <strong>Ecommerce Store</strong> Team</p>`
      : ` <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Your Verification Code</h2>
        <p>Dear ${user.username},</p>
        <p>Your verification code for accessing <strong>ChatBox</strong> is:</p>
        <p><strong style="font-size: 20px;">${code}</strong></p>
        <p>This code is valid for 5 minutes. If you didn’t request this, please ignore this email.</p>
        <p>Best regards,<br>The Your Ecommerce Store Team</p>
      </div>`
      }`,
  });

  res.status(200).json({
    message: "Email sent",
    code: codeInDb,
  });
};

// verify Code is pending

export {
  registerUser,
  loginUser,
  getSingleUser,
  logOutUser,
  uploadImageToDB,
  refreshAccessToken,
  sentVerificationCode,
};
