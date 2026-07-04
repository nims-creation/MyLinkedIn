const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const User = require("../models/User");

// Get notifications for a user
router.get("/:firebaseUid", async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.params.firebaseUid })
      .sort({ createdAt: -1 })
      .limit(50);
      
    // Populate sender details manually since we are using firebaseUids instead of ObjectIds
    const populated = await Promise.all(notifications.map(async (notif) => {
      let senderDetails = null;
      if (notif.sender) {
        senderDetails = await User.findOne({ firebaseUid: notif.sender }).select("name profilePicture");
      }
      return { ...notif.toObject(), senderDetails };
    }));

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all as read
router.post("/:firebaseUid/read", async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.params.firebaseUid, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "Marked all as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark single notification as read
router.post("/read/:id", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
