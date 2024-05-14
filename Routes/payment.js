import express from "express";
import Razorpay from "razorpay";
import authenticate from "../middlewares/jwt.js";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();
const app = express();

const router = express.Router();

const instance = new Razorpay({
  key_id: process.env.RAZOR_PAY_KEY_ID,
  key_secret: process.env.RAZOR_PAY_KEY_SECRET,
});

router.get("/getkey", (req, res) => {
  res.send({ key: process.env.RAZOR_PAY_KEY_ID });
});

router.post("/createorder", async (req, res) => {
  const options = {
    amount: req.body.amount * 100, // amount in smallest currency unit
    currency: "INR",
    receipt: "order_sample_1",
  };
  try {
    const order = await instance.orders.create(options);
    res.send({ success: true, order });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

router.post("/paymentverification", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body.response;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedsignature = crypto
    .createHmac("sha256", process.env.RAZOR_PAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedsignature !== razorpay_signature) {
    res.send({ success: false, message: "payment is not legit" });
  } else {
    res.send({
      success: true,
      message: "payment is  successful",
      payment_id: razorpay_payment_id,
    });
    // res.redirect(
    //   `http://localhost:4200/paymentsuccess?reference=${razorpay_payment_id}`
    // );
  }
});

export default router;
