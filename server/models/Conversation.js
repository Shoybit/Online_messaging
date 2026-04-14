const mongoose = require("mongoose");

socket.on("send_message", async (data) => {
  await Message.create(data);

  io.emit("receive_message", data);
});

const conversationSchema = new mongoose.Schema({
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Conversation", conversationSchema);
