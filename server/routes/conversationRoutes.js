const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");

router.post("/", async (req, res) => {
  const { senderId, receiverId } = req.body;

  let convo = await Conversation.findOne({
    members: { $all: [senderId, receiverId] },
  });

  if (!convo) {
    convo = await Conversation.create({
      members: [senderId, receiverId],
    });
  }

  res.json(convo);
});

module.exports = router;