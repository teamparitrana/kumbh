const path = require("path");
const express = require("express");
const morgan = require("morgan");
const cookieparser = require("cookie-parser");
const AppError = require("./utils/appErrors");
const userRouter = require("./route/userRoutes");
const reviewRouter = require("./route/reviewRoute");
const placeRouter = require("./route/placeRoute");
const tourRouter = require("./route/tourRoute");
const app = express();
const cors = require("cors");

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    origin: true,
    optionsSuccessStatus: 200,
    allowedHeaders: [
      "set-cookie",
      "Content-Type",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Credentials",
    ],
  })
);
app.use("/api/v1/place", placeRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/tours", tourRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`can't find the ${req.originalUrl} url`));
});

module.exports = app;
