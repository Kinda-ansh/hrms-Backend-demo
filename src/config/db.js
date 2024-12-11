/**
 * db.js
 * @description :: exports database connection using mongoose
 */

const mongoose = require("mongoose");
mongoose.set('strictQuery', true);

const uri =
  process.env.NODE_ENV === "dev" ? process.env.DB_DEV_URL : process.env.DB_URL;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db = mongoose.connection;

db.once("open", () => {
  console.log(`DB Connection Successful on ${uri}`);
});

db.on("error", () => {
  console.log("Error in mongodb connection");
});

module.exports = mongoose;