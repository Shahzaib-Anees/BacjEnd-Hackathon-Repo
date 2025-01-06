import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      enum: ["admin", "user"]
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
      }
    ]
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const hashedPassword = await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;
  next();
});

export default mongoose.model("User", userSchema);
