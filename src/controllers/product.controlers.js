import mongoose from "mongoose";
import { uploadImageToCloudinary } from "../methods/Methods.js";
import productSchema from "../models/product.model.js"

const getProducts = async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 3;
    const skip = (page - 1) * limit;
    try {
        const products = await productSchema.find({}).skip(skip).limit(limit);
        res.status(200).json({ data: products })
    } catch (error) {
        res.status(500).json({ message: "Internam Server Error while getting products" })
    }

}

const createProduct = async (req, res) => {
    const { name, description, price, image } = req.body;
    let imageUrl;
    if (!name) return res.status(400).json({ message: "Name is required" })
    if (!description) return res.status(400).json({ message: "Description is required" })
    if (!price) return res.status(400).json({ message: "Price is required" })
    if (!image) {
        return res.status(400).json({ message: "Image is required" })
    } else {
        try {
            const url = await uploadImageToCloudinary(image);
            imageUrl = url;
        } catch (error) {
            return res.status(500).json({ message: "Error uploading image" })
        }
    }

    const product = new productSchema({
        name,
        description,
        price,
        image: imageUrl,
        createdBy: req.user._id
    })

    return res.status(201).json({ message: "Product created successfully", product })
}

const getSingleProduct = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({
        message: "Not a valid product Id"
    })
    try {
        const product = await productSchema.findById(id);
        if (!product) return res.status(404).json({ message: "No product found with such id" })
        return res.status(200).json({ message: "Product fetched successfully" })
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error while fetching product",
            data: product
        })
    }

}

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({
        message: "Not a valid product Id"
    })

    const existingProduct = await productSchema.findById(id);
    if (!existingProduct) return res.status(404).json({ messsage: "No product found with such id" })
    if (existingProduct?.createdBy !== userId) return res.status(401).json({
        message: "Not authorized to update this product"
    })

    const { data } = req.body;
    const updates = await productSchema.findByIdAndUpdate(id,
        {
            ...data
        },
        {
            new: true
        }
    )

    return res.status(200).json(
        {
            message: "Product Updated Successfully",
            data: updates
        }
    );


}

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({
        message: "Not a valid product Id"
    })
    try {

        const existingProduct = await productSchema.findById(id);
        if (!existingProduct) return res.status(404).json({ messsage: "No product found with such id" })
        if (existingProduct?.createdBy !== userId) return res.status(401).json({
            message: "Not authorized to update this product"
        })

        const deleted = await productSchema.findByIdAndDelete(id);
        if (deleted) return res.status(200).json({ message: "Product deleted succesfully" })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server error while deleting product", error: error })
    }
}

export { getProducts, createProduct, getSingleProduct, updateProduct, deleteProduct };