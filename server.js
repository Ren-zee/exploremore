const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
const { body, validationResult } = require("express-validator");
const pool = require("./config/db");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(
  cors({
    origin: "http://localhost:3001", // Adjust based on your frontend URL
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: "your-secret-key-change-this-in-production", // Change this in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to false for local development (no HTTPS)
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Welcome Route
// Serve index.html for the root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ==========================
// Input Validation Middleware
// ==========================
const signupValidation = [
  body("username")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// ==========================
// Signup Route
// ==========================
app.post("/signup", signupValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { username, email, password, role = "user" } = req.body;

    console.log("Signup request received:", { username, email, role });

    // Check if username already exists
    const checkUsernameQuery = "SELECT id FROM users WHERE username = ?";
    pool.query(checkUsernameQuery, [username], async (err, usernameResults) => {
      if (err) {
        console.error("Error checking username:", err);
        return res.status(500).json({
          success: false,
          message: "Server error during signup",
        });
      }

      if (usernameResults.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      }

      // Check if email already exists
      const checkEmailQuery = "SELECT id FROM users WHERE email = ?";
      pool.query(checkEmailQuery, [email], async (err, emailResults) => {
        if (err) {
          console.error("Error checking email:", err);
          return res.status(500).json({
            success: false,
            message: "Server error during signup",
          });
        }

        if (emailResults.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Email already exists",
          });
        }

        try {
          // Hash password
          const hashedPassword = await bcrypt.hash(password, 12);

          // Insert new user
          const insertQuery =
            "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)";
          pool.query(
            insertQuery,
            [username, email, hashedPassword, role],
            (err, result) => {
              if (err) {
                console.error("Error inserting user:", err);
                return res.status(500).json({
                  success: false,
                  message: "Error creating account",
                });
              }

              res.status(201).json({
                success: true,
                message: "Account created successfully",
                userId: result.insertId,
              });
            }
          );
        } catch (hashError) {
          console.error("Error hashing password:", hashError);
          return res.status(500).json({
            success: false,
            message: "Error processing password",
          });
        }
      });
    });
  } catch (error) {
    console.error("Unexpected error during signup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ==========================
// Login Route
// ==========================
app.post("/login", loginValidation, (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    console.log("Login attempt for email:", email);

    const query =
      "SELECT id, username, email, password_hash, role FROM users WHERE email = ?";
    pool.query(query, [email], async (err, results) => {
      if (err) {
        console.error("Error querying the database:", err);
        return res.status(500).json({
          success: false,
          message: "Server error during login",
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const user = results[0];

      try {
        const isValidPassword = await bcrypt.compare(
          password,
          user.password_hash
        );

        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            message: "Invalid email or password",
          });
        }

        // Create session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;

        res.status(200).json({
          success: true,
          message: "Login successful",
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
        });
      } catch (compareError) {
        console.error("Error comparing password:", compareError);
        return res.status(500).json({
          success: false,
          message: "Error during authentication",
        });
      }
    });
  } catch (error) {
    console.error("Unexpected error during login:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ==========================
// Logout Route
// ==========================
app.post("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Could not log out",
        });
      }
      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    });
  } else {
    res.status(200).json({
      success: true,
      message: "No active session",
    });
  }
});

// ==========================
// Protected Route Middleware
// ==========================
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.userId || req.session.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

// ==========================
// Get Current User (Protected)
// ==========================
app.get("/profile", requireAuth, (req, res) => {
  const query =
    "SELECT id, username, email, role, created_at FROM users WHERE id = ?";
  pool.query(query, [req.session.userId], (err, results) => {
    if (err) {
      console.error("Error fetching user profile:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching profile",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: results[0],
    });
  });
});

// ==========================
// Submit Feedback (Protected)
// ==========================
app.post(
  "/submit-feedback",
  requireAuth,
  [
    body("feedback")
      .isLength({ min: 1, max: 1000 })
      .withMessage("Feedback must be between 1 and 1000 characters")
      .trim(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { feedback } = req.body;
    const userId = req.session.userId;

    const query = "INSERT INTO feedback (user_id, feedback) VALUES (?, ?)";
    pool.query(query, [userId, feedback], (err, result) => {
      if (err) {
        console.error("Error inserting feedback:", err);
        return res.status(500).json({
          success: false,
          message: "Error submitting feedback",
        });
      }

      res.status(200).json({
        success: true,
        message: "Feedback submitted successfully",
        feedbackId: result.insertId,
      });
    });
  }
);

// ==========================
// Admin: Get Unverified Feedbacks
// ==========================
app.get("/feedbacks", requireAdmin, (req, res) => {
  const query = `
    SELECT f.id, f.feedback, f.created_at, f.is_verified,
           u.username, u.email
    FROM feedback f
    JOIN users u ON f.user_id = u.id
    WHERE f.is_verified = FALSE
    ORDER BY f.created_at DESC
  `;

  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching feedbacks:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching feedbacks",
      });
    }

    res.status(200).json({
      success: true,
      feedbacks: results,
    });
  });
});

// ==========================
// Admin: Verify Feedback
// ==========================
app.post(
  "/verify-feedback",
  requireAdmin,
  [
    body("feedbackId")
      .isInt({ min: 1 })
      .withMessage("Valid feedback ID is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { feedbackId } = req.body;

    const query = "UPDATE feedback SET is_verified = TRUE WHERE id = ?";
    pool.query(query, [feedbackId], (err, result) => {
      if (err) {
        console.error("Error verifying feedback:", err);
        return res.status(500).json({
          success: false,
          message: "Error verifying feedback",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Feedback not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Feedback verified successfully",
      });
    });
  }
);

// ==========================
// Get Verified Feedbacks (Public)
// ==========================
app.get("/get-feedbacks", (req, res) => {
  console.log("GET /get-feedbacks endpoint called");

  const query = `
    SELECT f.id, f.feedback, f.created_at,
           u.username
    FROM feedback f
    JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
    LIMIT 20
  `;

  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching feedbacks:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching feedbacks",
      });
    }

    console.log("Feedbacks query results:", results);
    console.log("Number of feedbacks found:", results.length);

    res.status(200).json({
      success: true,
      feedbacks: results,
    });
  });
});

// ==========================
// Error Handling Middleware
// ==========================
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});


// ==========================
// Get Price Breakdown
// ==========================
app.get("/api/price-breakdown/:spotId", (req, res) => {
  const spotId = parseInt(req.params.spotId);

  if (isNaN(spotId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid spot ID",
    });
  }

  const query = `
  SELECT category, label, price_min, price_max, notes
  FROM price_breakdown
  WHERE spot_id = ?
`;

  db.query(query, [spotId], (err, results) => {
    if (err) {
      console.error("Error fetching price breakdown:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching price data",
      });
    }

    res.status(200).json({
      success: true,
      breakdown: results,
    });
  });
});


// ==========================
// 404 Handler
// ==========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;

