const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    headline: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    connections: [{
      type: String, // Array of firebaseUids
    }],
    sentRequests: [{
      type: String, // Array of firebaseUids
    }],
    receivedRequests: [{
      type: String, // Array of firebaseUids
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
