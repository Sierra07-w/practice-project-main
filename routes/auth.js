const express = require("express");
const bcrypt = require("bcryptjs");
const connectDB = require("../database/mongo");

const router = express.Router();

// Signup endpoint
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const db = await connectDB();
    
    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Hash password and create user
    const hash = await bcrypt.hash(password, 10);
    await db.collection("users").insertOne({
      email,
      password: hash,
      createdAt: new Date()
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const db = await connectDB();
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Set session
    req.session.userId = user._id.toString();
    req.session.userEmail = user.email;

    res.status(200).json({ message: "Logged in successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout endpoint
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
});

// Check auth status endpoint
router.get("/status", (req, res) => {
  if (req.session.userId) {
    res.status(200).json({ authenticated: true, email: req.session.userEmail });
  } else {
    res.status(200).json({ authenticated: false });
  }
});

module.exports = router;
