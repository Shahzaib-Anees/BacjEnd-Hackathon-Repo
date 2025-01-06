import mongoose from "mongoose";
import productModel from "./product.model.js";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  let prices = 0;
  if (update.products) {
    let prices = 0;
    for (let i = 0; i < update.products.length; i++) {
      try {
        const product = await productModel.findOne({ _id: update.products[i] });
        prices += product.price;
      } catch (error) {
        console.log(error);
      }
    }
    update.totalPrice = prices;
  }
  this.totalPrice = prices;
  next();
});

export default mongoose.model("Order", orderSchema);
