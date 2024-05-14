import express from "express";
import authenticate from "../middlewares/jwt.js";
import User from "../models/user.js";
import sendVerificationEmail from "../common/index.js";
import bcrypt from "bcrypt";
const router = express.Router();

router.get("/isauthenticated", authenticate, async (req, res) => {
  res.send({ success: true, message: "User is authenticated" });
});

router.get("/isadmin", authenticate, async (req, res) => {
  // console.log(req.user);
  if (req.user.isAdmin == true) {
    res.send({ success: true, message: "User is admin" });
  } else {
    res.send({ success: false, message: "User is not admin" });
  }
});

//verifiying the user when he clicks on the link sent to his mail

router.get("/verifyuser/:token", async (req, res) => {
  try {
    const user = await User.findOne({ token: req.params.token });
    if (user) {
      user.verified = true;
      user.token = "";
      await user.save();

      res.write("<h1>user verified</h1>");
      res.write(
        '<script>setTimeout(() => { window.location.href = "http://localhost/login"; }, 3000);</script>'
      );
      res.end();
    } else {
      res.send({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

//handling forget password when user click forget password

router.post("/forgetpassword", async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    const user = await User.findOne({ email });

    await sendVerificationEmail(
      null,
      email,
      "Reset password",
      "forgetpassword"
    );

    res.send({ success: true, message: "reset password mail is sent" });
  } catch (error) {
    console.error("Error sending email:", error.message);
    // Handle the error as needed
  }
});

router.put("/resetpassword", async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({ token });
    if (user) {
      const hashedpassword = await bcrypt.hash(password, 10);
      user.password = hashedpassword;
      user.token = "";
      await user.save();
      res.send({ success: true, message: "password reset success" });
    } else {
      res.send({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

router.post("/changepassword", authenticate, async (req, res) => {
  const { oldpassword, newpassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const ismatch = await bcrypt.compare(oldpassword, user.password);
    if (ismatch) {
      const hashedpassword = await bcrypt.hash(newpassword, 10);
      user.password = hashedpassword;
      await user.save();
      res.send({ success: true, message: "password changed success" });
    } else {
      res.send({ success: false, message: "old password is incorrect" });
    }
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

export default router;
