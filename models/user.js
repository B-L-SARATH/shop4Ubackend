import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    token: { type: String, default: "" },
    verified: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  }
);

const usermodel = mongoose.model("User", userSchema);

export default usermodel;
