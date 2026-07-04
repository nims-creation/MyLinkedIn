const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Notification = require("../models/Notification");

// Test route to verify router is working
router.get("/test", (req, res) => {
  res.json({
    message: "Users router is working!",
    timestamp: new Date().toISOString(),
  });
});

// Get all users (for testing)
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}).select("-__v");
    res.json({
      message: "Users fetched successfully",
      count: users.length,
      users: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    // console.log("User search query:", q); // Debug log

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const searchQuery = q.trim();
    // console.log("Searching for users with name containing:", searchQuery);

    // Search users by name (case-insensitive)
    const users = await User.find({
      name: { $regex: searchQuery, $options: "i" },
    })
      .select("firebaseUid name headline bio profilePicture")
      .limit(10);

    // console.log(`Found ${users.length} users:`, users.map((u) => u.name));
    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Failed to search users" });
  }
});

// Debug route for temporary use
// This route is for debugging purposes only and should not be used in production
router.get("/debug/all", async (req, res) => {
  try {
    const users = await User.find({}).select("name firebaseUid").limit(5);
    // console.log("All users in database:", users);
    res.json({
      count: users.length,
      users: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Get user network details
router.get("/:firebaseUid/network", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [connections, receivedRequests, sentRequests] = await Promise.all([
      User.find({ firebaseUid: { $in: user.connections } }).select("firebaseUid name headline profilePicture"),
      User.find({ firebaseUid: { $in: user.receivedRequests } }).select("firebaseUid name headline profilePicture"),
      User.find({ firebaseUid: { $in: user.sentRequests } }).select("firebaseUid name headline profilePicture")
    ]);

    res.json({ connections, receivedRequests, sentRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get("/:firebaseUid", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update user profile
router.post("/", async (req, res) => {
  try {
    const { firebaseUid, email, name, bio, headline, profilePicture } =
      req.body;

    let user = await User.findOne({ firebaseUid });

    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.bio = bio !== undefined ? bio : user.bio;
      user.headline = headline !== undefined ? headline : user.headline;
      user.profilePicture =
        profilePicture !== undefined ? profilePicture : user.profilePicture;

      await user.save();
    } else {
      // Create new user
      user = new User({
        firebaseUid,
        email,
        name: name || "",
        bio: bio || "",
        headline: headline || "",
        profilePicture: profilePicture || "",
      });
      await user.save();
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Complete profile endpoint
router.post("/complete-profile", async (req, res) => {
  try {
    const { firebaseUid, name, headline, bio, profilePicture } = req.body;

    if (!name || !headline || !bio || !profilePicture) {
      return res.status(400).json({
        message:
          "All fields are required: name, headline, bio, and profile picture",
      });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    user.headline = headline;
    user.bio = bio;
    user.profilePicture = profilePicture;

    await user.save();

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user profile
router.put("/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const updates = req.body;

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
      }
    });

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Send connection request
router.post("/:firebaseUid/connect/:targetUid", async (req, res) => {
  try {
    const { firebaseUid, targetUid } = req.params;
    
    if (firebaseUid === targetUid) {
      return res.status(400).json({ message: "Cannot connect with yourself" });
    }

    const [user, targetUser] = await Promise.all([
      User.findOne({ firebaseUid }),
      User.findOne({ firebaseUid: targetUid })
    ]);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already connected or request sent
    if (user.connections.includes(targetUid)) {
      return res.status(400).json({ message: "Already connected" });
    }
    if (user.sentRequests.includes(targetUid)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    user.sentRequests.push(targetUid);
    targetUser.receivedRequests.push(firebaseUid);

    await Promise.all([user.save(), targetUser.save()]);

    // Create Notification
    const notif = new Notification({
      recipient: targetUid,
      sender: firebaseUid,
      type: "connection_request",
      content: `${user.name || "Someone"} sent you a connection request.`
    });
    await notif.save();

    // Emit real-time socket event
    const io = req.app.get("io");
    if (io) {
      io.to(targetUid).emit("newNotification", notif);
    }

    res.json({ message: "Connection request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept connection request
router.post("/:firebaseUid/accept/:targetUid", async (req, res) => {
  try {
    const { firebaseUid, targetUid } = req.params;

    const [user, targetUser] = await Promise.all([
      User.findOne({ firebaseUid }),
      User.findOne({ firebaseUid: targetUid })
    ]);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure request exists
    if (!user.receivedRequests.includes(targetUid)) {
      return res.status(400).json({ message: "No pending request from this user" });
    }

    // Remove from requests arrays
    user.receivedRequests = user.receivedRequests.filter(id => id !== targetUid);
    targetUser.sentRequests = targetUser.sentRequests.filter(id => id !== firebaseUid);

    // Add to connections
    if (!user.connections.includes(targetUid)) user.connections.push(targetUid);
    if (!targetUser.connections.includes(firebaseUid)) targetUser.connections.push(firebaseUid);

    await Promise.all([user.save(), targetUser.save()]);

    // Create Notification
    const notif = new Notification({
      recipient: targetUid,
      sender: firebaseUid,
      type: "connection_accepted",
      content: `${user.name || "Someone"} accepted your connection request.`
    });
    await notif.save();

    // Emit real-time socket event
    const io = req.app.get("io");
    if (io) {
      io.to(targetUid).emit("newNotification", notif);
    }

    res.json({ message: "Connection request accepted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Decline connection request
router.post("/:firebaseUid/decline/:targetUid", async (req, res) => {
  try {
    const { firebaseUid, targetUid } = req.params;

    const [user, targetUser] = await Promise.all([
      User.findOne({ firebaseUid }),
      User.findOne({ firebaseUid: targetUid })
    ]);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    user.receivedRequests = user.receivedRequests.filter(id => id !== targetUid);
    targetUser.sentRequests = targetUser.sentRequests.filter(id => id !== firebaseUid);

    await Promise.all([user.save(), targetUser.save()]);
    res.json({ message: "Connection request declined" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove connection
router.post("/:firebaseUid/remove/:targetUid", async (req, res) => {
  try {
    const { firebaseUid, targetUid } = req.params;

    const [user, targetUser] = await Promise.all([
      User.findOne({ firebaseUid }),
      User.findOne({ firebaseUid: targetUid })
    ]);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    user.connections = user.connections.filter(id => id !== targetUid);
    targetUser.connections = targetUser.connections.filter(id => id !== firebaseUid);

    await Promise.all([user.save(), targetUser.save()]);
    res.json({ message: "Connection removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// AI Bio Enhance Mock
router.post("/:firebaseUid/enhance-bio", async (req, res) => {
  try {
    const { currentBio } = req.body;
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const enhancedBio = `🚀 Passionate Professional | Innovator & Problem Solver\n\n${currentBio ? currentBio + "\n\n" : ""}Driven by a relentless curiosity and a passion for creating impactful solutions. I specialize in turning complex challenges into streamlined, user-centric experiences. Always eager to collaborate, learn, and push the boundaries of what's possible in the tech ecosystem.`;
    
    res.json({ enhancedBio });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
