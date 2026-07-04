const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    type: {
      type: String, // Full-time, Part-time, Contract
      default: "Full-time",
    },
    description: {
      type: String,
      required: true,
    },
    salary: {
      type: String,
      default: "Not disclosed",
    },
    postedBy: {
      type: String, // firebaseUid of the recruiter
      required: true,
    },
    applicants: [{
      type: String, // firebaseUids of applicants
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);
