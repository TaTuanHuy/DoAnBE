const express = require("express");
const router = express.Router();
const OrderProduct = require("../app/controlers/OrderController");
const { authMiddleWare, authUserMiddleWare } = require("../app/Middleware/authMiddleware");

router.patch("/edit-order/:id", OrderProduct.editOrder);
router.post("/create-order", OrderProduct.createOrder);
router.get("/get-order", OrderProduct.getAllOrder);
router.post("/find-by-range", OrderProduct.findByRange)
router.post("/find-by-date", OrderProduct.findByDate)
router.post("/find-by-month", OrderProduct.findByMonth)
router.get('/user/:id', authUserMiddleWare, OrderProduct.getUserOrder)
router.get('/:id', authUserMiddleWare, OrderProduct.getOneOrder)
router.delete("/:id", OrderProduct.deleteOrder);
module.exports = router;
