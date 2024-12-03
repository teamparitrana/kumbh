const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION");

  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const app = require("./app");

const db = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(db, {}).then((con) => {
  console.log(`Name of the database is ${con.connection.name}`);
  console.log("Successfully connected to the database");
});

const portnumber = 3000;
const server = app.listen(portnumber, () => {
  console.log("App is running on port 3000");
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION");
  server.close(() => {
    process.exit(1);
  });
});
