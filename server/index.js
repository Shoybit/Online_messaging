const Message = require("./models/Message");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// socket
const io = new Server(server, {
  cors: { origin: "*" },
});

// 🔥 ONLY THIS PART
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("send_message", async (data) => {
    await Message.create(data);

    io.emit("receive_message", data); // sabar kase jabe
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("API working");
});

server.listen(5002, () => console.log("Server running on 5002"));