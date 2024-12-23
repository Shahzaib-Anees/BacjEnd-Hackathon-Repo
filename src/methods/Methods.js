import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

const generateAccessToken = (user) => {
  const token = jwt.sign(
    { email: user.email },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  return token;
};

const generateRefreshToken = (user) => {
  const token = jwt.sign(
    { email: user.email },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

const uploadImageToCloudinary = async (localFile) => {
  try {
    const response = await cloudinary.uploader.upload(localFile, {
      resource_type: "auto",
    });

    return response.url;
  } catch (error) {
    console.log(error);
    return "Error in uploading file to cloudinary", error;
  }
};

export { generateAccessToken, generateRefreshToken , uploadImageToCloudinary };
