const express = require("express");
const AdminRouter = express.Router();
const app = express();
const { adminModel, userModel, courseModel } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { z } = require("zod");
const { adminMiddleware } = require("../middleware/admin");
dotenv.config({ quiet: true });
const JWT_SECRET_ADMIN = process.env.JWT_SECRET_ADMIN;

AdminRouter.post("/signup", async (req, res) => {
  const requiredBody = z.object({
    email: z.email(),
    password: z.string().min(3).max(30),
    firstName: z.string().min(3).max(100),
    lastName: z.string().min(3).max(100),
  });

  const parsedData = requiredBody.safeParse(req.body);

  if (!parsedData.success) {
    res.json({
      message: "incorrect format",
      error: parsedData.error,
    });
  }

  const { email, password, firstName, lastName } = req.body;

  // same as ----> (but destructured)
  //
  // const email = req.body.email;
  // const password = req.body.password;
  // const firstName = req.body.firstName;
  // const lastName = req.body.lastName;

  try {
    const hashedPassword = await bcrypt.hash(password, 5);

    await adminModel.create({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
    });

    res.json({
      message: "You have signed up",
    });
  } catch (e) {
    res.status(403).json({
      message: "User already exists",
    });
  }
});

AdminRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const admin = await adminModel.findOne({
    email: email,
  });

  if (!admin) {
    res.status(403).json({
      message: "User does not exist",
    });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, admin.password);
  if (!passwordMatch) {
    res.status(403).json({
      message: "Incorrect credentials",
    });
  } else {
    const token = jwt.sign(
      {
        id: admin._id.toString(),
      },
      JWT_SECRET_ADMIN
    );
    res.json({
      token: token,
    });
  }
});

AdminRouter.post("/course", adminMiddleware, async (req, res) => {
  const adminId = req.adminId;

  const { title, description, imageURL, price } = req.body;
  const course = await courseModel.create({
    title,
    description,
    imageURL,
    price,
    creatorId: adminId,
  });
  res.json({
    message: "Course created",
    courseId: course._id,
  });
});

AdminRouter.put("/course", adminMiddleware, async (req, res) => {
  const { title, description, imageURL, price, courseId } = req.body;
  const course = await courseModel.updateOne(
    {
      _id: courseId,
      creatorId: req.adminId,
    },
    {
      title,
      description,
      imageURL,
      price,
    }
  );
  res.json({
    message: "course updated",
    courseId: course._id,
  });
});

AdminRouter.get("/course/bulk", async (req, res) => {
  const adminId = req.adminId;
  const courses = await courseModel.find({
    adminId,
  });

  res.json({
    courses: courses,
  });
});

module.exports = {
  AdminRouter: AdminRouter,
};
