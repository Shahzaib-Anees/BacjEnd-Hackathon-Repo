import mongoose from "mongoose";
import orderSchema from "../models/order.model.js";
import productSchema from "../models/product.model.js";
import userSchema from "../models/user.model.js";

const createOrder = async (req, res) => {
  const user = req.user;
  const existingUser = await userSchema.findOne({ email: user.email });
  if (!existingUser)
    return res.status(404).json({ message: "Unauthorized User" });
  const { productId } = req.body;
  if (!productId)
    return res.status(400).json({ message: "Product id is required" });
  const existingProduct = await productSchema.findById(productId);
  if (!existingProduct)
    return res
      .status(404)
      .message({ message: "No product found with such id" });

  const existingOrder = await orderSchema.findOne({ user: existingUser._id });
  if (existingOrder) {
    const update = await orderSchema.findByIdAndUpdate(
      existingOrder._id,
      {
        $push: { products: productId },
      },
      {
        new: true,
      }
    );
    res.status(200).json({ message: "Product added to cart", data: update });
  } else {
    const createdOrder = await orderSchema.create({
      user: existingUser._id,
      products: [productId],
    });

    existingProduct.orderItems.push(createdOrder._id);
    const updatedProduct = await existingProduct.save();

    return res.status(200).json({
      message: "Product added to cart",
      data: createdOrder,
      productData: updatedProduct,
    });
  }
};

const getOrders = async (req, res) => {
  const user = req.user;
  const existingUser = await userSchema.findOne({ email: user.email });
  if (!existingUser)
    return res.status(404).json({ message: "Unauthorized User" });

  try {
    const existingOrder = await orderSchema.findOne({
      user: existingUser._id,
    });
    if (!existingOrder)
      return res.status(404).json({ message: "No order found" });
    return res.status(200).json({
      message: "Order fetched successfully",
      data: existingOrder,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error });
  }
};

const getSingleOrder = async (req, res) => {
  const { id } = req.params;
  if (!id)
    return res.status(400).json({
      message: "Id is required",
    });

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({
      message: "Not a valid Id",
    });

  try {
    const existingOrder = await orderSchema.findById(id);
    if (!existingOrder)
      return res.status(404).json({
        message: "No order found",
      });

    return res.status(200).json({
      message: "Order fetched successfully",
      data: existingOrder,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error });
  }
};

export { createOrder, getOrders, getSingleOrder };
