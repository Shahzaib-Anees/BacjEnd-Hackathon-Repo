import express from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
} from "../controllers/product.controlers.js";
import { authenticateUser } from "../middlewares/authentication.middleware.js";
import { upload } from "../middlewares/multer.middlerware.js";

const router = express.Router();

router.post("/", upload.single("image"), authenticateUser, createProduct);
router.get("/", getProducts);
router.get("/:id", getSingleProduct);
router.put("/:id", authenticateUser, updateProduct);
router.delete("/:id", authenticateUser, deleteProduct);

export default router;
