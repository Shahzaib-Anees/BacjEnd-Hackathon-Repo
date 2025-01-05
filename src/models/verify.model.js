import mongoose from "mongoose";
const verfiySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verificationCode: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const schemaForVerify = new mongoose.model("Verify", verfiySchema);
