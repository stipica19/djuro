const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const authentication = require("./routes/authentication")(router);
const protask = require("./routes/protask");
require("dotenv").config();
const app = express();

const uri = `mongodb+srv://stipica11:stipo123@cluster0.ielh6.mongodb.net/EP_djuro?retryWrites=true&w=majority`;
// connects mongoose to the uri and sets some mongoose keys to true to combat mongoose's deprecation warnings
mongoose.connect(uri, {
  useNewUrlParser: true,

  useUnifiedTopology: true,
});
const connection = mongoose.connection;
// make sure that MongoDB connected successfully
connection.once("open", () => {
  console.log("MongoDB database connected!!");
});

app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

app.use("/authentication", authentication);
app.use("/protask", protask);

app.listen(3000, (req, res) => {
  console.log("SERVER JE STARTOVAN NA PORTU 3000");
});
