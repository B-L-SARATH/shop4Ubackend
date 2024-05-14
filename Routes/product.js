import express from "express";
import Product from "../models/product.js";
import Order from "../models/order.js";
import authenticate from "../middlewares/jwt.js";
// import products from "../data/products.js";

const router = express.Router();

// router.get("/products", async (req, res) => {
//   const products = await Product.find({});
//   res.json({ success: true, products });
// });

router.get("/products", async (req, res) => {
  // console.log(req.query);
  let pagesize = 3;
  let page = Number(req.query.page) || 1;

  const keyword = req.query.search
    ? {
        name: {
          $regex: req.query.search,
          $options: "i",
        },
      }
    : {};

  const sort = req.query.sort ? req.query.sort : 0;
  console.log(sort);
  console.log(typeof sort);

  //if sort ==1 then sort by price low to high
  //if sort ==2 then sort by price high to low
  //if sort ==3 then sort by rating high to low
  //if sort ==4 then sort by rating low to high

  try {
    const count = await Product.countDocuments(keyword);

    if (sort == 1) {
      const products = await Product.find(keyword)
        .sort({ price: 1 })
        .limit(pagesize)
        .skip(pagesize * (page - 1));
      return res.json({
        success: true,
        products,
        page,
        pages: Math.ceil(count / pagesize),
      });
    } else if (sort == 2) {
      const products = await Product.find(keyword)
        .sort({ price: -1 })
        .limit(pagesize)
        .skip(pagesize * (page - 1));
      return res.json({
        success: true,
        products,
        page,
        pages: Math.ceil(count / pagesize),
      });
    } else if (sort == 3) {
      const products = await Product.find(keyword)
        .sort({ rating: -1 })
        .limit(pagesize)
        .skip(pagesize * (page - 1));
      return res.json({
        success: true,
        products,
        page,
        pages: Math.ceil(count / pagesize),
      });
    } else if (sort == 4) {
      const products = await Product.find(keyword)
        .sort({ rating: 1 })
        .limit(pagesize)
        .skip(pagesize * (page - 1));
      return res.json({
        success: true,
        products,
        page,
        pages: Math.ceil(count / pagesize),
      });
    } else {
      const products = await Product.find(keyword)
        .limit(pagesize)
        .skip(pagesize * (page - 1));
      res.json({
        success: true,
        products,
        page,
        pages: Math.ceil(count / pagesize),
      });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json({ success: true, product });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.post("/products", authenticate, async (req, res) => {
  try {
    const product = {
      user: req.user._id,
      name: req.body.name,
      price: req.body.price,
      image: req.body.image,
      brand: req.body.brand,
      category: req.body.category,
      countInStock: req.body.countInStock,
      description: req.body.description,
      numReviews: 0,
    };
    const newproduct = await Product.create(product);
    res.json({ success: true, newproduct });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.put("/updateproduct/:id", authenticate, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.delete("/deleteproduct/:id", authenticate, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.post("/product/:id/addreview", authenticate, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      const orders = await Order.find({ user: req.user._id });
      let flag = 0;
      orders.forEach((order) => {
        if (
          order.orderItems.find(
            (x) => x.product.toString() == req.params.id.toString()
          )
        ) {
          flag = 1;
        }
      });

      if (!flag) {
        return res.json({
          success: false,
          message: "you can only review when you order the product",
        });
      }

      if (
        product.reviews.find(
          (x) => x.user.toString() === req.user._id.toString()
        )
      ) {
        return res.json({
          success: false,
          message: "You already submitted a review",
        });
      }
      const review = {
        user: req.user._id,
        name: req.user.name,
        rating: req.body.rating,
        comment: req.body.comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;
      await product.save();
      res.json({ success: true, message: "Review added successfully" });
    } else {
      res.json({ success: false, message: "Product not found" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.put("/product/:id/updatereview", authenticate, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (
      product.reviews.find((x) => x.user.toString() === req.user._id.toString())
    ) {
      const reviewIndex = product.reviews.findIndex(
        (x) => x.user.toString() === req.user._id.toString()
      );
      const newreview = {
        user: req.user._id,
        name: req.user.name,
        rating: req.body.rating,
        comment: req.body.comment,
      };
      product.reviews[reviewIndex] = newreview;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;
      await product.save();
      res.json({ success: true, message: "Review updated successfully" });
    } else {
      res.json({ success: false, message: "Review not found" });
    }
  } catch (e) {
    console.log(e.message);
    res.json({ success: false, message: e.message });
  }
});
export default router;
