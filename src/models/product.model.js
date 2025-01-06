import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"]
    },
    description: {
        type: String,
        required: [true, "Product description is required"]
    },
    image: {
        type: String,
        required: [true, "Product image is required"]
    },
    price: {
        type: Number,
        required: [true, "Product price is required"]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    orderItems: [
        {
            tyoe: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        }
    ]
},
    {
        timestamps: true
    }
)


export default mongoose.model("Product", productSchema);