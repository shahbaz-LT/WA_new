import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import Customer from "./modules/customer/index.js";
import Order from "./modules/order/index.js";
import Webhooks from "./modules/webhooks/index.js";

const app = express().use(bodyParser.json());

mongoose.set("strictQuery", false);
mongoose.connect('mongodb+srv://admin:admin@cluster0.jesrrzk.mongodb.net/?retryWrites=true&w=majority',()=>{
  console.log("MongoDB Connection established");
});
mongoose.Promise = global.Promise;


app.get("/", (req, res) => {
  res.status(200).send("Hello, this is the WhatsApp-Railway Project");
});

Customer.init(app);
Order.init(app);
Webhooks.init(app);

//Route Errors
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

app.listen(8080, () => {
  console.log("WebHook server listening at http://localhost:8080");
});
