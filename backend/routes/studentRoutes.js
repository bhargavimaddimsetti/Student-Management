const express = require("express");
const mongoose = require("mongoose");
const Student = require("../models/Student");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET all students of logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const students = await Student.find({
      userId: req.userId,
    });

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch students",
    });
  }
});

// GET one student of logged-in user
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid student ID",
      });
    }

    const student = await Student.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!student) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch student",
    });
  }
});

// CREATE student
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, email, course, age } = req.body;

    if (!name || !email || !course || age === undefined || age === "") {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    if (Number(age) < 17 || Number(age) > 100) {
      return res.status(400).json({
        error: "Age must be between 17 and 100",
      });
    }

    const student = await Student.create({
      name: name.trim(),
      email: email.trim(),
      course: course.trim(),
      age: Number(age),
      userId: req.userId,
    });

    res.status(201).json({
      message: "Student created successfully",
      student,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// UPDATE student
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid student ID",
      });
    }

    const { name, email, course, age } = req.body;

    if (!name || !email || !course || age === undefined || age === "") {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    if (Number(age) < 17 || Number(age) > 100) {
      return res.status(400).json({
        error: "Age must be between 17 and 100",
      });
    }

    const student = await Student.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      {
        name: name.trim(),
        email: email.trim(),
        course: course.trim(),
        age: Number(age),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!student) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// DELETE student
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid student ID",
      });
    }

    const student = await Student.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!student) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete student",
    });
  }
});

module.exports = router;