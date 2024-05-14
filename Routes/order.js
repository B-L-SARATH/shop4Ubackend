import express from "express";
import Order from "../models/order.js";
import Product from "../models/product.js";
import authenticate from "../middlewares/jwt.js";
const router = express.Router();

router.post("/order", authenticate, async (req, res) => {
  try {
    console.log(req.user);
    const user = req.user._id;
    const orders = req.body.orderItems;
    const orderItems = orders.map((order) => {
      return {
        name: order.name,
        qty: order.qty,
        image: order.img,
        price: order.price,
        product: order.id,
      };
    });
    const shippingAddress = req.body.shippingAddress;
    const shippingPrice = req.body.shippingPrice;
    const totalPrice = req.body.totalPrice;
    const paymentResult = req.body.paymentResult;

    // checking if the prouct has quantity

    orders.map(async (order) => {
      const product = await Product.findById(order.id);
      if (product.countInStock < order.qty) {
        return res.send({
          success: false,
          message: "some product out of stock",
        });
      }
    });

    const order = await Order.create({
      user,
      orderItems,
      shippingAddress,
      shippingPrice,
      totalPrice,
      paymentResult,
    });

    // Decrease the quantity of the product

    orders.map(async (order) => {
      const product = await Product.findById(order.id);
      product.countInStock = product.countInStock - order.qty;
      await product.save();
    });

    res.send({ success: true, message: "Order placed successfully" });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

router.get("/myorders", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("user");

    res.send({ success: true, orders });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user");

    res.send({ success: true, orders });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

router.get("/order/:id", authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id).populate("user");
    res.send({ success: true, order });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

router.put("/deliverorder/:id", authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id);
    console.log("route is called ", id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();
      res.send({ success: true, message: "Order Delivered" });
    } else {
      res.send({ success: false, message: "Order not found" });
    }
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

router.post("/isproductsavailable", async (req, res) => {
  try {
    let flag = true;
    const orders = req.body.cartitems;
    const promises = orders.map(async (order) => {
      const product = await Product.findById(order.id);
      if (product.countInStock < order.qty) {
        console.log("product is out of stock");
        flag = false;
        return res.send({
          success: false,
          message: "some product out of stock",
        });
      }
    });
    await Promise.all(promises);

    if (flag)
      res.send({ success: true, message: "All products are available" });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});
export default router;
