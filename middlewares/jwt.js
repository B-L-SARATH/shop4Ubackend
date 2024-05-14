import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
function authenticate(req, res, next) {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.SECRET_KEY, (err, result) => {
    if (result) {
      req.user = result.user;
      next();
    } else {
      res.send({ success: false, message: "unauthorized user" });
    }
  });
}


export default authenticate;
