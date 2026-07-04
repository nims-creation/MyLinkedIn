const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Get chat history between two users
router.get("/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Mark messages as read
router.post("/mark-read", async (req, res) => {
  try {
    const { sender, receiver } = req.body;
    // Mark all messages sent by 'sender' to 'receiver' as read
    await Message.updateMany(
      { sender, receiver, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages read:", error);
    res.status(500).json({ message: "Failed to mark as read" });
  }
});

module.exports = router;
