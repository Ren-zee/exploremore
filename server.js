const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./db"); // Ensure db.js is correctly configured

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Welcome Route
app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

// ==========================
// Signup Route
// ==========================
app.post("/signup", (req, res) => {
  const { fullname, email, password, role } = req.body;

  console.log("Signup request received:", { fullname, email, password, role });

  if (!fullname || !email || !password || !role) {
    console.log("Missing fields:", { fullname, email, password, role });
    return res.status(400).send("All fields are required.");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const query =
    "INSERT INTO users (fullname, email, password_hash, role) VALUES (?, ?, ?, ?)";
  db.query(query, [fullname, email, hashedPassword, role], (err, result) => {
    if (err) {
      console.error("Error inserting user:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).send("Email already exists.");
      }
      return res.status(500).send("Error creating account.");
    }
    res.status(201).send("Account created successfully.");
  });
});

// ==========================
// Login Route
// ==========================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  const query = "SELECT id, password_hash, role FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).send("Server error during login.");
    }

    if (results.length === 0) {
      return res.status(404).send("User not found.");
    }

    const user = results[0];
    const isValidPassword = bcrypt.compareSync(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).send("Invalid password.");
    }

    res.status(200).json({ userId: user.id, role: user.role });
  });
});

// ==========================
// Submit Feedback
// ==========================
app.post("/submit-feedback", (req, res) => {
  const { userId, feedback } = req.body;

  if (!userId || !feedback) {
    return res.status(400).send("User ID and feedback are required.");
  }

  const query = "INSERT INTO feedback (user_id, feedback) VALUES (?, ?)";
  db.query(query, [userId, feedback], (err) => {
    if (err) {
      console.error("Error inserting feedback:", err);
      return res.status(500).send("Error submitting feedback.");
    }
    res.status(200).send("Feedback submitted successfully.");
  });
});

// ==========================
// Admin: Get Unverified Feedbacks
// ==========================
app.get("/feedbacks", (req, res) => {
  const query = "SELECT * FROM feedback WHERE is_verified = FALSE";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching feedbacks:", err);
      return res.status(500).send("Error fetching feedbacks.");
    }
    res.status(200).json(results);
  });
});

// ==========================
// Admin: Verify Feedback
// ==========================
app.post("/verify-feedback", (req, res) => {
  const { feedbackId } = req.body;

  if (!feedbackId) {
    return res.status(400).send("Feedback ID is required.");
  }

  const query = "UPDATE feedback SET is_verified = TRUE WHERE id = ?";
  db.query(query, [feedbackId], (err) => {
    if (err) {
      console.error("Error verifying feedback:", err);
      return res.status(500).send("Error verifying feedback.");
    }
    res.status(200).send("Feedback verified successfully.");
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
