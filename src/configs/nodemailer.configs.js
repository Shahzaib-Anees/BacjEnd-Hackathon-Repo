import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: `${process.env.MY_EMAIL_ADDRESS}`,
    pass: `${process.env.MY_EMAIL_PASSWORD}`,
  },
});
