import orderSchema from "../models/order.model.js";
import productSchema from "../models/product.model";
import userSchema from "../models/user.model.js"

const createOrder = async (req, res) => {
    const userId = req.user;
    const { productId } = req.body
    if (!userId) return res.status(401).json({ message: "User is not authenticated" });
    if (!productId) return res.status(400).json({ message: "Product id is required" })
    const existingProduct = await productSchema.findById(id);
    if (!existingProduct) return res.status(404).message({ message: "No product found with such id" })

    const existingOrder = await orderSchema.findOne({ user: userId });
    if (existingOrder) {
        let prices = 0;
        for (let i = 0; i < this.products.length; i++) {
            try {
                const product = await productSchema.findOne({ _id: existingOrder.products[i] });
                prices += product.price;
            } catch (err) {
                console.log(err);
            }
        }

        const update = await orderSchema.findbyIdandUpdate(id, {
            products: [...existingOrder.products, ...productId],
            totalPrice: prices
        },
            {
                new: true
            }
        )
        res.status(200).json({ message: "Product added to cart", data: update })
    } else {
        const createOrder = await orderSchema.create({
            user: userId,
            products: [productId]
        })

        const updatedProduct = await productSchema.findByIdandUpdate(id, {
            orderItems: [...existingProduct.orderItems, ...createOrder._id]
        })

        return res.status(200).json({ message: "Product added to cart", data: createOrder })
    }
}

const getOrders = async (req, res) => {
    const userId = req.user;
    if (!userId) return res.status(401).json({
        message: "Unauthorized Product"
    })

    const existingUser = await userSchema.findById(userId);
    if (!existingUser) return res.status(404).json({ message: "No user found" })

    try {
        const existingOrder = await orderSchema.findOne({
            user: userId
        })
        if (!existingOrder) return res.status(404).json({ message: "No order found" })
        return res.status(200).json({
            message: "Order fetched successfully",
            data: existingOrder
        })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error })
    }
}

const getSingleOrder = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({
        message: "Id is required"
    })

    try {
        const existingOrder = await orderSchema.findById(id);
        if (!existingOrder) return res.status(404).json({
            message: "No order found"
        })

        return res.status(200).json({
            message: "Order fetched successfully",
            data: existingOrder
        })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error })
    }
}

export { createOrder, getOrders, getSingleOrder }