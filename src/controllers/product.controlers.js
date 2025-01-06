import mongoose from "mongoose";
import { uploadImageToCloudinary } from "../methods/Methods.js";
import productSchema from "../models/product.model.js";
import userSchema from "../models/user.model.js";

const getProducts = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 3;
  const skip = (page - 1) * limit;
  try {
    const products = await productSchema.find({}).skip(skip).limit(limit);
    res.status(200).json({ data: products });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internam Server Error while getting products" });
  }
};

const createProduct = async (req, res) => {
  const { name, description, price } = req.body;
  const image = req.file.path;
  const user = req.user;
  try {
    const existingUser = await userSchema.findOne({ email: user.email });
    if (!existingUser)
      return res.status(404).json({ message: "Unauthorized User" });
    let imageUrl;
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!description)
      return res.status(400).json({ message: "Description is required" });
    if (!price) return res.status(400).json({ message: "Price is required" });
    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    } else {
      try {
        const url = await uploadImageToCloudinary(image);
        imageUrl = url;
      } catch (error) {
        return res.status(500).json({ message: "Error uploading image" });
      }
    }

    const product = await productSchema.create({
      name,
      description,
      price,
      image: imageUrl,
      createdBy: existingUser._id,
    });

    return res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internam Server Error while creating product",
    });
  }
};

const getSingleProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({
      message: "Not a valid product Id",
    });
  try {
    const product = await productSchema.findById(id);
    if (!product)
      return res.status(404).json({ message: "No product found with such id" });
    return res.status(200).json({
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error while fetching product",
      data: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const existingUser = await userSchema.findOne({ email: user.email });
    if (!existingUser)
      return res.status(404).json({ message: "Unauthorized User" });
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({
        message: "Not a valid product Id",
      });

    const existingProduct = await productSchema.findById(id);
    if (!existingProduct)
      return res
        .status(404)
        .json({ messsage: "No product found with such id" });
    if (existingProduct?.createdBy.toString() != existingUser._id.toString())
      return res.status(401).json({
        message: "Not authorized to update this product",
        id: existingProduct._id,
        productCreatedBy: existingProduct.createdBy,
        user: existingUser._id,
      });

    const data = req.body;
    const updates = await productSchema.findByIdAndUpdate(id, data, {
      new: true,
    });

    return res.status(200).json({
      message: "Product Updated Successfully",
      data: updates,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error while updating product",
      data: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const existingUser = await userSchema.findOne({ email: user.email });
  if (!existingUser)
    return res.status(404).json({ message: "Unauthorized User" });
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({
      message: "Not a valid product Id",
    });
  try {
    const existingProduct = await productSchema.findById(id);
    if (!existingProduct)
      return res
        .status(404)
        .json({ messsage: "No product found with such id" });
    if (existingProduct?.createdBy.toString() !== existingUser._id.toString())
      return res.status(401).json({
        message: "Not authorized to update this product",
      });

    const deleted = await productSchema.findByIdAndDelete(id);
    if (deleted)
      return res.status(200).json({ message: "Product deleted succesfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server error while deleting product",
      error: error,
    });
  }
};

export {
  getProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
