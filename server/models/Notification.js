const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: String, // firebaseUid
      required: true,
    },
    sender: {
      type: String, // firebaseUid (optional, e.g., for system notifications)
    },
    type: {
      type: String,
      enum: ["connection_request", "connection_accepted", "message"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
