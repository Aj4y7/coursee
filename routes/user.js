const express = require("express");
const app = express();
const UserRouter = express.Router();
const { userModel, purchaseModel, courseModel } = require("../db");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const { userMiddleware } = require("../middleware/user");
dotenv.config({ quiet: true });
const JWT_SECRET_USER = process.env.JWT_SECRET_USER;

UserRouter.post("/signup", async (req, res) => {
  const requiredBody = z.object({
    email: z.email(),
    password: z.string().min(3).max(30),
    firstName: z.string().min(3).max(100),
    lastName: z.string().min(3).max(100),
  });

  const parsedData = requiredBody.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "Incorrect format",
      error: parsedData.error,
    });
    return;
  }

  const { email, password, firstName, lastName } = parsedData.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 5);

    await userModel.create({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
    });

    res.json({
      message: "signed up",
    });
  } catch (e) {
    res.status(403).json({
      message: "User already exists",
    });
  }
});

UserRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({
    email: email,
  });
  if (!user) {
    res.status(403).json({
      message: "User does not exist",
    });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (passwordMatch) {
    const token = jwt.sign(
      {
        id: user._id.toString(),
      },
      JWT_SECRET_USER
    );
    res.json({
      token: token,
    });
  } else {
    res.status(403).json({
      message: "Incorrect credentials",
    });
  }
});

UserRouter.get("/purchases", userMiddleware, async (req, res) => {
  const userId = req.userId;
  const purchasedCourses = await purchaseModel.find({
    userId,
  });

  const coursesData = await courseModel.find({
    _id: { $in: purchasedCourses.map((x) => x.courseId) },
  });
  res.json({
    purchasedCourses,
    coursesData,
  });
});

module.exports = {
  UserRouter: UserRouter,
};
