import mongoose from "mongoose";

const productOrderSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        }
    ]
},
    {
        timestamps: true
    }
)

export default mongoose.model("ProductOrder", productOrderSchema);