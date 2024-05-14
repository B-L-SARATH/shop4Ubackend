import express from "express";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db.js";
import productRoutes from "./Routes/product.js";
import userRoutes from "./Routes/user.js";
import authroutes from "./Routes/auth.js";
import orderRoutes from "./Routes/order.js";
import paymentRoutes from "./Routes/payment.js";
import cors from "cors";
dotenv.config();

const app = express();
connectDB();

app.use(express.json());
app.use(cors());
// app.use(
//   cors({
//     origin: "http://localhost:5173", // or '*' to allow from all origins
//   })
// );

//serving static files
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

//using the routes in the app
app.use("/api", productRoutes);
app.use("/api", userRoutes);
app.use("/api", authroutes);
app.use("/api", orderRoutes);
app.use("/api", paymentRoutes);
// app.use("/api", uploadRoutes);
// app.use("/api", adminRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
