const Message = require("./models/Message");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
app.use(cors());

const server = http.createServer(app);


const authRoutes = require("./routes/authRoutes");

app.use(express.json()); // MUST
app.use("/api/auth", authRoutes);


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const io = new Server(server, {
  cors: { origin: "*" },
});

//authMiddleware.js
const authMiddleware = require("./middleware/authMiddleware");

app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({ msg: "Protected data", user: req.user });
});

socket.on("send_message", async (data) => {
  await Message.create(data);

  io.emit("receive_message", data); // all users
});




app.get("/", (req, res) => {
  res.send("API working");
});

io.on("connection", (socket) => {
  console.log("User connected");

socket.on("send_message", async (data) => {
  await Message.create(data); 
  socket.broadcast.emit("receive_message", data);
});

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(5002, () => console.log("Server running on 5002"));