import express from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendVerificationEmail from "../common/index.js";
const router = express.Router();

router.post("/register", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const isuser = await User.findOne({ email });
    if (isuser) {
      res.send({ success: false, message: "User already exists" });
    } else {
      const hashedpassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hashedpassword,
      });
      await sendVerificationEmail(name, email, "Verify your Account", "signup");
      res.send({ success: true, message: "User created successfully" });
    }
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.send({ success: false, message: "User not found" });
    } else {
      if (!user.verified) {
        return res.send({
          success: false,
          message: "User not verified please verify your mail",
        });
      }
      const result = await bcrypt.compare(password, user.password);
      if (result) {
        const token = jwt.sign({ user }, process.env.SECRET_KEY, {
          expiresIn: "1d",
        });
        res.send({ success: true, message: "Login success", token, email });
      } else {
        res.send({ success: false, message: "Invalid Credentials" });
      }
    }
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

router.get("/userbymail/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const user = await User.findOne({ email }).select("-password");
    if (user) {
      res.send({ success: true, user });
    } else {
      res.send({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.send({ success: true, users });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

router.get("/user/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id).select("-password");
    res.send({ success: true, user });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

router.put("/updateuser/:id", async (req, res) => {
  const id = req.params.id;
  const user = req.body;
  try {
    const result = await User.findByIdAndUpdate(id, user);
    res.send({ success: true, message: "User updated successfully" });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

router.delete("/deleteuser/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await User.findByIdAndDelete(id);
    res.send({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});
export default router;
