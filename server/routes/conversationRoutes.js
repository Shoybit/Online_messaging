const router = require("express").Router();
const Conversation = require("../models/Conversation");

// create new conversation
router.post("/", async (req, res) => {
  const { senderId, receiverId } = req.body;

  const newConv = new Conversation({
    members: [senderId, receiverId],
  });

  const saved = await newConv.save();
  res.json(saved);
});

// get user conversations
router.get("/:userId", async (req, res) => {
  const convs = await Conversation.find({
    members: { $in: [req.params.userId] },
  });

  res.json(convs);
});

module.exports = router;