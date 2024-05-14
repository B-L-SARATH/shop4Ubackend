import sibMailService from "sib-api-v3-sdk";
import crypto from "crypto";
import path from "path";
import ejs from "ejs";
import { fileURLToPath } from "url";
import User from "../models/user.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url)); //we need use this when we use es6 module
const defaultClient = sibMailService.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
// apiKey.apiKey = process.env.SENDINBLUE_API_KEY;
apiKey.apiKey = "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";

const sendVerificationEmail = async (name, email, subject, filename) => {
  const apiInstance = new sibMailService.TransactionalEmailsApi();
  const sender = {
    email: "leelasarathbaswa@gmail.com",
    name: "shop4U",
  };
  const receivers = [
    {
      email,
    },
  ];

  try {
    const refreshtoken = crypto.randomBytes(16).toString("hex");

    // const expiretoken = Date.now() + 3600 * 24 * 1000;
    // console.log(refreshtoken);

    let template = path.resolve(__dirname, "../views/" + filename + ".ejs");

    // Render the EJS template with dynamic data
    const templatedata = await ejs.renderFile(template, {
      name,
      token: refreshtoken,
    });

    // Send the email with rendered HTML content
    const sendEmail = await apiInstance.sendTransacEmail({
      sender,
      to: receivers,
      subject,
      textContent: "shop4U",
      htmlContent: templatedata,
    });

    console.log("mail sent");

    // Save the token in the database

    const user = await User.findOne({ email });
    // console.log(user);
    user.token = refreshtoken;
    await user.save();

    // console.log("token saved");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};

export default sendVerificationEmail;
