import { authenticateUser } from "../middlewares/authentication.middleware.js";
import express from "express";
import { createOrder, getOrders, getSingleOrder } from "../controllers/order.controllers.js";

const router = express.Router();

router.post("/", authenticateUser, createOrder);
router.get("/", authenticateUser, getOrders)
router.get("/:id", authenticateUser, getSingleOrder);

export default router;