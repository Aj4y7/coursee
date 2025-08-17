const { Router } = require("express");
const { userMiddleware } = require("../middleware/user");
const { purchaseModel, courseModel } = require("../db");
const CourseRouter = Router();

CourseRouter.post("/purchase", userMiddleware, async (req, res) => {
  const userId = req.userId;
  const courseId = req.body.courseId;

  console.log("userId: " + userId + " courseId: " + courseId);

  await purchaseModel.create({
    userId,
    courseId,
  });

  res.json({
    message: "You have successfully bought the course",
  });
});

CourseRouter.get("/", async (req, res) => {
  const courses = await courseModel.find({});

  res.json({
    courses,
  });
});

module.exports = {
  CourseRouter: CourseRouter,
};
