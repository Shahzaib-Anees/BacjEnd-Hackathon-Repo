import express from "express";
import { createProduct, deleteProduct, getProducts, getSingleProduct, updateProduct } from "../controllers/product.controlers.js";
import { authenticateUser } from "../middlewares/authentication.middleware.js";

const router = express.Router();

router.post("/create", upload.single("image"), authenticateUser, createProduct);
router.get("/products", getProducts);
router.get("/products/:id", getSingleProduct)
router.put("/products/:id", authenticateUser, updateProduct)
router.delete("/products/:id", authenticateUser, deleteProduct);

export default router