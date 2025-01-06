import { authenticateUser } from "../middlewares/authentication.middleware.js";
import express from "express";
import { createOrder, getOrders, getSingleOrder } from "../controllers/order.controllers.js";

const router = express.Router();

router.post("/orders", authenticateUser, createOrder);
router.get("/orders", authenticateUser, getOrders)
router.get("/orders/:id", authenticateUser, getSingleOrder);

export default router;