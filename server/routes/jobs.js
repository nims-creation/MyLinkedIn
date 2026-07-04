const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const User = require("../models/User");

// Get all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a job
router.post("/", async (req, res) => {
  try {
    const { title, company, location, type, description, salary, postedBy } = req.body;
    const newJob = new Job({ title, company, location, type, description, salary, postedBy });
    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Apply for a job
router.post("/:id/apply", async (req, res) => {
  try {
    const { firebaseUid } = req.body;
    const job = await Job.findById(req.params.id);
    
    if (!job) return res.status(404).json({ message: "Job not found" });
    
    if (job.applicants.includes(firebaseUid)) {
      return res.status(400).json({ message: "Already applied" });
    }

    job.applicants.push(firebaseUid);
    await job.save();
    
    res.json({ message: "Applied successfully", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
