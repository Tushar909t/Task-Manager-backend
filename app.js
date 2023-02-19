// Basic Lib Import
const express = require("express");
const router = require("./src/routes/api");
const app = new express();
const bodyParser = require("body-parser");
const path = require("path");

// Security Middleware Lib Import
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");

// Database Lib Import
const mongoose = require("mongoose");
app.use(express.static("../client-side/build"));

// Security Middleware Implement
app.use(cors());
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
// implement Json Data Limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
// Body Parser Implement
app.use(bodyParser.json());

// Request Rate Limit
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3000 });
app.use(limiter);

// Mongo DB Database Connection
let URI = "mongodb://localhost:27017/task";
// "mongodb+srv://mern:fktwJs7r5zM99j1G@cluster0.t42n4hi.mongodb.net/?retryWrites=true&w=majority";
let OPTION = {
  autoIndex: false, // Don't build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};
// mongoose.set("strictQuery", false);
mongoose.connect(URI, OPTION, (error) => {
  console.log("Connection Success");
  console.log(error);
});

// Routing Implement
app.use("/api/v1", router);

// Undefine Route Implement
// app.use("*", (req, res) => {
//   res.status(404).json({ status: "Fail", data: "Not Found" });
// });

// Add React Front End Routing
app.get("*", function (req, res) {
  res.sendFile(
    path.resolve(__dirname, "../client-side/", "build", "index.html")
  );
});

module.exports = app;
