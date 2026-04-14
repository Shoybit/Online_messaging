const express = require("express");
const router = express.Router();  

const User = require("../models/User");

// REGISTER
const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

// 👇 USERS LIST (IMPORTANT)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router; 