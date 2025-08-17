const dotenv = require("dotenv");
dotenv.config({ quiet: true });
const MONGO_URL = process.env.MONGO_URL;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { UserRouter } = require("./routes/user");
const { CourseRouter } = require("./routes/courses");
const { AdminRouter } = require("./routes/admin");

app.use(express.json());
app.use("/user", UserRouter);
app.use("/courses", CourseRouter);
app.use("/admin", AdminRouter);

async function main() {
  await mongoose.connect(`${MONGO_URL}`);
  app.listen(3000);
  console.log("listening on port 3000");
}
main();
