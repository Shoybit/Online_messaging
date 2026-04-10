const User = require("../models/User");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
  });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
  });
};



// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ msg: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ msg: "Wrong password" });
  }

  // 🔐 JWT TOKEN
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};