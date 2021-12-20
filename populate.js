require("dotenv").config();

const connectDB = require("./db/connection");
const Product = require("./models/Product");
const jsonProducts = require("./products.json");

const start = async () => {
  try {
    await connectDB(process.env.DATABASE_URI);
    await Product.deleteMany();
    await Product.create(jsonProducts);
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

start();
