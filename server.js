require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
const { body, validationResult } = require("express-validator");
const pool = require("./config/db");
const path = require("path");
const app = express();
const leoProfanity = require("leo-profanity");

app.use(express.static(path.join(__dirname, "public")));

// Middleware
const allowedOrigins = [
  "https://exploremore-rouge.vercel.app",
  "https://exploremore-production-c375.up.railway.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

// Apply CORS globally using official middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-User-Id",
      "X-User-Email",
    ],
    optionsSuccessStatus: 200,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-for-development",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain: process.env.NODE_ENV === "production" ? undefined : "localhost", // Don't set domain in production
    },
  })
);

// Serve index.html for the root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Test endpoint to check if server is working
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Server is working!",
    timestamp: new Date().toISOString(),
    cors: req.headers.origin,
    sessionId: req.sessionID,
    hasSession: !!req.session.userId,
    userId: req.session.userId,
    userRole: req.session.role,
  });
});

// Debug endpoint to check authentication status
app.get("/api/auth-status", (req, res) => {
  res.json({
    success: true,
    sessionId: req.sessionID,
    userId: req.session?.userId || null,
    role: req.session?.role || null,
    hasSession: !!req.session?.userId,
    headers: {
      origin: req.headers.origin,
      userAgent: req.headers["user-agent"],
      cookie: req.headers.cookie ? "present" : "absent",
    },
  });
});

// ========================
// Alternative Auth for Cross-Domain
// ========================
function requireAdminWithToken(req, res, next) {
  // First try session-based auth
  if (req.session && req.session.userId && req.session.role === "admin") {
    return next();
  }

  // Then try token-based auth via header
  const adminToken = req.headers["x-admin-token"];
  if (adminToken) {
    // Simple token validation - in production, use proper JWT
    const expectedToken =
      process.env.ADMIN_TOKEN || "admin-dashboard-token-2025";
    if (adminToken === expectedToken) {
      return next();
    }
  }

  return res.status(401).json({
    success: false,
    message: "Admin authentication required",
  });
}

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
// Admin Authentication Middleware
// ==========================
function requireAuth(req, res, next) {
  console.log("🔍 requireAuth - Session:", {
    sessionId: req.sessionID,
    userId: req.session?.userId,
    hasSession: !!req.session,
  });
  console.log("🔍 requireAuth - Headers:", {
    "x-user-id": req.headers["x-user-id"],
    "x-user-email": req.headers["x-user-email"],
    origin: req.headers.origin,
  });
  console.log("🔍 requireAuth - Body:", {
    userId: req.body?.userId,
    userEmail: req.body?.userEmail,
  });

  // First try session-based authentication
  if (req.session && req.session.userId) {
    console.log("✅ Session-based auth successful");
    return next();
  }

  // Fallback: Try to authenticate using headers and body for cross-domain scenarios
  const userIdFromHeader = req.headers["x-user-id"];
  const userEmailFromHeader = req.headers["x-user-email"];
  const userIdFromBody = req.body.userId;
  const userEmailFromBody = req.body.userEmail;

  const userId = userIdFromHeader || userIdFromBody;
  const userEmail = userEmailFromHeader || userEmailFromBody;

  if (userId && userEmail) {
    console.log(
      "🔄 Trying fallback auth with userId:",
      userId,
      "email:",
      userEmail
    );
    // Verify the user exists in the database
    const query =
      "SELECT id, email, username, role FROM users WHERE id = $1 AND email = $2";
    pool.query(query, [userId, userEmail], (err, result) => {
      if (err) {
        console.error("❌ Error verifying user:", err);
        return res.status(500).json({
          success: false,
          message: "Authentication verification failed",
        });
      }

      if (result.rows.length === 0) {
        console.log("❌ User not found in database");
        return res.status(401).json({
          success: false,
          message: "Invalid user credentials",
        });
      }

      console.log(
        "✅ Fallback auth successful for user:",
        result.rows[0].username
      );
      // Set the user info in req for use in the route handler
      req.user = result.rows[0];
      req.session.userId = result.rows[0].id; // Update session as well
      req.session.role = result.rows[0].role;
      return next();
    });
    return; // Don't continue execution here, wait for the database query
  }

  console.log("❌ No valid authentication found");
  return res.status(401).json({
    success: false,
    message: "Authentication required",
  });
}

function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.session.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
}

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
    const checkUsernameQuery = "SELECT id FROM users WHERE username = $1";
    pool.query(checkUsernameQuery, [username], async (err, usernameResults) => {
      if (err) {
        console.error("Error checking username:", err);
        return res.status(500).json({
          success: false,
          message: "Server error during signup",
        });
      }

      if (usernameResults.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      }

      // Check if email already exists
      const checkEmailQuery = "SELECT id FROM users WHERE email = $1";
      pool.query(checkEmailQuery, [email], async (err, emailResults) => {
        if (err) {
          console.error("Error checking email:", err);
          return res.status(500).json({
            success: false,
            message: "Server error during signup",
          });
        }

        if (emailResults.rows.length > 0) {
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
            "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id";
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
                userId: result.rows[0].id,
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
      "SELECT id, username, email, password_hash, role FROM users WHERE email = $1";
    pool.query(query, [email], async (err, results) => {
      if (err) {
        console.error("Error querying the database:", err);
        return res.status(500).json({
          success: false,
          message: "Server error during login",
        });
      }

      if (results.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const user = results.rows[0];

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
          // Include admin token for dashboard access
          adminToken:
            user.role === "admin"
              ? process.env.ADMIN_TOKEN || "admin-dashboard-token-2025"
              : undefined,
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
// Get Current User (Protected)
// ==========================
app.get("/profile", requireAuth, (req, res) => {
  const query =
    "SELECT id, username, email, role, created_at FROM users WHERE id = $1";
  pool.query(query, [req.session.userId], (err, results) => {
    if (err) {
      console.error("Error fetching user profile:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching profile",
      });
    }

    if (results.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: results.rows[0],
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
    const userId = req.session.userId || (req.user && req.user.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in session or request",
      });
    }

    const query =
      "INSERT INTO feedback (user_id, feedback) VALUES ($1, $2) RETURNING id";
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
        feedbackId: result.rows[0].id,
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
      feedbacks: results.rows,
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

    const query = "UPDATE feedback SET is_verified = TRUE WHERE id = $1";
    pool.query(query, [feedbackId], (err, result) => {
      if (err) {
        console.error("Error verifying feedback:", err);
        return res.status(500).json({
          success: false,
          message: "Error verifying feedback",
        });
      }

      if (result.rowCount === 0) {
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

  // Check if we want only verified feedbacks
  const verified = req.query.verified;

  let query = `
    SELECT f.id, f.feedback, f.filtered_feedback, f.created_at, f.is_verified,
           u.username
    FROM feedback f
    JOIN users u ON f.user_id = u.id
  `;

  // Add WHERE clause if verified parameter is provided
  if (verified === "true") {
    query += ` WHERE f.is_verified = true`;
  }

  query += `
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

    console.log("Feedbacks query results:", results.rows);
    console.log("Number of feedbacks found:", results.rows.length);

    res.status(200).json({
      success: true,
      feedbacks: results.rows,
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
  WHERE spot_id = $1
`;

  pool.query(query, [spotId], (err, results) => {
    if (err) {
      console.error("Error fetching price breakdown:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching price data",
      });
    }

    res.status(200).json({
      success: true,
      breakdown: results.rows,
    });
  });
});

// ========================
// Get sql to user dashboard
// ===========================

app.get("/api/users-with-feedback", (req, res) => {
  const query = `
    SELECT 
      u.username,
      u.email,
      u.role,
      u.created_at,
      COUNT(f.id) AS feedback_count
    FROM users u
    LEFT JOIN feedback f ON f.user_id = u.id
    GROUP BY u.id
  `;

  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users with feedback info:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching user data",
      });
    }

    res.status(200).json({
      success: true,
      users: results.rows,
    });
  });
});

// ==========================
// To get sql pricebreak table to dashboard price breakdown section (and vice versa)
// ==========================

app.post("/api/update-price-breakdown", (req, res) => {
  const { spotId, category, label, price_min, price_max, notes } = req.body;

  const query = `
    UPDATE price_breakdown
    SET price_min = $1, price_max = $2, notes = $3
    WHERE spot_id = $4 AND category = $5 AND label = $6
  `;

  pool.query(
    query,
    [price_min, price_max, notes, spotId, category, label],
    (err, result) => {
      if (err) {
        console.error("Error updating price:", err);
        return res
          .status(500)
          .json({ success: false, message: "Update failed" });
      }

      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No matching record found" });
      }

      res.status(200).json({ success: true, message: "Update successful" });
    }
  );
});

//initialize  profanity filter

// ==========================
// Enhanced Submit Feedback Endpoint (ADD THIS NEW ENDPOINT)
// ==========================
app.post("/api/feedback/submit", (req, res) => {
  const { feedback, user_id } = req.body;

  if (!feedback || !user_id) {
    return res.status(400).json({
      success: false,
      message: "Feedback and user ID are required",
    });
  }

  // Filter the feedback for profanity
  const filteredFeedback = leoProfanity.clean(feedback.feedback); // ✅ CORRECT

  // Check if feedback contains profanity
  const containsProfanity = leoProfanity.isProfane(feedback);

  // Insert feedback with both original and filtered versions
  const query = `
    INSERT INTO feedback (user_id, feedback, filtered_feedback, is_verified, created_at) 
    VALUES ($1, $2, $3, $4, NOW()) RETURNING id
  `;

  // Auto-verify if no profanity, otherwise leave unverified for manual review
  const isVerified = !containsProfanity;

  pool.query(
    query,
    [user_id, feedback, filteredFeedback, isVerified],
    (err, result) => {
      if (err) {
        console.error("Error submitting feedback:", err);
        return res.status(500).json({
          success: false,
          message: "Error submitting feedback",
        });
      }

      res.status(201).json({
        success: true,
        message: "Feedback submitted successfully",
        data: {
          id: result.rows[0].id,
          containsProfanity: containsProfanity,
          isVerified: isVerified,
        },
      });
    }
  );
});

// ==========================
// Enhanced Stats Endpoint (REPLACE YOUR EXISTING /api/stats)
// ==========================
app.get("/api/stats", (req, res) => {
  const queries = [
    "SELECT COUNT(*) as total FROM feedback",
    "SELECT COUNT(*) as verified FROM feedback WHERE is_verified = 1",
    "SELECT COUNT(*) as unverified FROM feedback WHERE is_verified = 0",
    "SELECT COUNT(*) as filtered FROM feedback WHERE feedback != filtered_feedback",
  ];

  Promise.all(
    queries.map(
      (query) =>
        new Promise((resolve, reject) => {
          pool.query(query, (err, results) => {
            if (err) reject(err);
            else resolve(results.rows[0]);
          });
        })
    )
  )
    .then((results) => {
      const stats = {
        total: results[0].total,
        verified: results[1].verified,
        unverified: results[2].unverified,
        filtered: results[3].filtered,
      };

      res.status(200).json({
        success: true,
        data: stats,
      });
    })
    .catch((err) => {
      console.error("Error getting stats:", err);
      res.status(500).json({
        success: false,
        message: "Error getting statistics",
      });
    });
});

// ==========================
// Re-filter Existing Feedback Endpoint (ADD THIS NEW ENDPOINT)
// ==========================
app.post("/api/feedback/refilter", (req, res) => {
  // Get all existing feedbacks
  pool.query("SELECT id, feedback FROM feedback", (err, results) => {
    if (err) {
      console.error("Error fetching feedbacks for refiltering:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching feedbacks",
      });
    }

    let processed = 0;
    let updated = 0;

    if (results.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No feedbacks to refilter",
        processed: 0,
        updated: 0,
      });
    }

    results.rows.forEach((feedback) => {
      const filteredFeedback = leoProfanity.clean(feedback.feedback); // ✅ CORRECT
      const containsProfanity = leoProfanity.check(feedback.feedback);

      // Update the feedback with filtered version
      pool.query(
        "UPDATE feedback SET filtered_feedback = $1, is_verified = $2 WHERE id = $3",
        [filteredFeedback, !containsProfanity, feedback.id],
        (updateErr, updateResult) => {
          processed++;

          if (!updateErr && updateResult.rowCount > 0) {
            updated++;
          }

          // Send response when all feedbacks are processed
          if (processed === results.rows.length) {
            res.status(200).json({
              success: true,
              message: "Refiltering completed",
              processed: processed,
              updated: updated,
            });
          }
        }
      );
    });
  });
});

// ==========================
// Get Profanity Statistics Endpoint (ADD THIS NEW ENDPOINT)
// ==========================
app.get("/api/feedback/profanity-stats", (req, res) => {
  const queries = [
    "SELECT COUNT(*) as totalProfane FROM feedback WHERE feedback != filtered_feedback",
    "SELECT COUNT(*) as verifiedProfane FROM feedback WHERE feedback != filtered_feedback AND is_verified = 1",
    "SELECT COUNT(*) as unverifiedProfane FROM feedback WHERE feedback != filtered_feedback AND is_verified = 0",
  ];

  Promise.all(
    queries.map(
      (query) =>
        new Promise((resolve, reject) => {
          pool.query(query, (err, results) => {
            if (err) reject(err);
            else resolve(results.rows[0]);
          });
        })
    )
  )
    .then((results) => {
      const profanityStats = {
        totalProfane: results[0].totalProfane,
        verifiedProfane: results[1].verifiedProfane,
        unverifiedProfane: results[2].unverifiedProfane,
      };

      res.status(200).json({
        success: true,
        data: profanityStats,
      });
    })
    .catch((err) => {
      console.error("Error getting profanity stats:", err);
      res.status(500).json({
        success: false,
        message: "Error getting profanity statistics",
      });
    });
});
// ==========================
// Admin: Get All Feedbacks (with filters)
// ==========================
app.get("/api/feedback", (req, res) => {
  const { search, user, status, date } = req.query;

  let query = `
    SELECT 
      f.id, 
      f.feedback, 
      f.filtered_feedback,
      f.is_verified, 
      f.created_at, 
      u.username 
    FROM feedback f
    JOIN users u ON f.user_id = u.id
  `;

  const queryParams = [];
  const conditions = [];

  if (search) {
    conditions.push(`f.feedback LIKE ?`);
    queryParams.push(`%${search}%`);
  }
  if (user) {
    conditions.push(`u.username = ?`);
    queryParams.push(user);
  }
  if (status) {
    conditions.push(`f.is_verified = ?`);
    queryParams.push(status === "verified" ? 1 : 0);
  }
  if (date) {
    conditions.push(`DATE(f.created_at) = ?`);
    queryParams.push(date);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY f.created_at DESC";

  pool.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching all feedbacks:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching feedbacks",
      });
    }

    res.status(200).json({
      success: true,
      data: results.rows,
    });
  });
});

// ==========================
// Get current session user
// ==========================
app.get("/api/session", (req, res) => {
  if (req.session && req.session.userId) {
    res.status(200).json({
      id: req.session.userId,
      username: req.session.username,
      role: req.session.role,
    });
  } else {
    res.status(401).json({ error: "Not logged in" });
  }
});

// ==========================
// Toggle Feedback Status
// ==========================
app.post("/api/feedbacks/toggle/:id", (req, res) => {
  const feedbackId = req.params.id;

  // First get current status
  pool.query(
    "SELECT is_verified FROM feedback WHERE id = $1",
    [feedbackId],
    (err, results) => {
      if (err) {
        console.error("Error getting feedback status:", err);
        return res.status(500).json({
          success: false,
          message: "Error getting feedback status",
        });
      }

      if (results.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Feedback not found",
        });
      }

      const currentStatus = results.rows[0].is_verified;
      const newStatus = currentStatus ? 0 : 1;

      // Update with opposite status
      pool.query(
        "UPDATE feedback SET is_verified = $1 WHERE id = $2",
        [newStatus, feedbackId],
        (err, result) => {
          if (err) {
            console.error("Error toggling feedback status:", err);
            return res.status(500).json({
              success: false,
              message: "Error toggling feedback status",
            });
          }

          res.status(200).json({
            success: true,
            message: "Feedback status toggled successfully",
          });
        }
      );
    }
  );
});

// ==========================
// Delete Single Feedback
// ==========================
app.delete("/api/feedbacks/delete/:id", (req, res) => {
  const feedbackId = req.params.id;

  pool.query(
    "DELETE FROM feedback WHERE id = $1",
    [feedbackId],
    (err, result) => {
      if (err) {
        console.error("Error deleting feedback:", err);
        return res.status(500).json({
          success: false,
          message: "Error deleting feedback",
        });
      }

      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Feedback not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Feedback deleted successfully",
      });
    }
  );
});

// ==========================
// Bulk Verify Feedbacks
// ==========================
app.post("/api/feedbacks/bulk-verify", (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No feedback IDs provided",
    });
  }

  const placeholders = ids.map(() => "?").join(",");
  const query = `UPDATE feedback SET is_verified = 1 WHERE id IN (${placeholders})`;

  pool.query(query, ids, (err, result) => {
    if (err) {
      console.error("Error bulk verifying feedbacks:", err);
      return res.status(500).json({
        success: false,
        message: "Error bulk verifying feedbacks",
      });
    }

    res.status(200).json({
      success: true,
      message: `${result.rowCount} feedbacks verified successfully`,
    });
  });
});

// ==========================
// Bulk Unverify Feedbacks
// ==========================
app.post("/api/feedbacks/bulk-unverify", (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No feedback IDs provided",
    });
  }

  const placeholders = ids.map(() => "?").join(",");
  const query = `UPDATE feedback SET is_verified = 0 WHERE id IN (${placeholders})`;

  pool.query(query, ids, (err, result) => {
    if (err) {
      console.error("Error bulk unverifying feedbacks:", err);
      return res.status(500).json({
        success: false,
        message: "Error bulk unverifying feedbacks",
      });
    }

    res.status(200).json({
      success: true,
      message: `${result.rowCount} feedbacks unverified successfully`,
    });
  });
});

// ==========================
// Bulk Delete Feedbacks
// ==========================
app.post("/api/feedbacks/bulk-delete", (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No feedback IDs provided",
    });
  }

  const placeholders = ids.map(() => "?").join(",");
  const query = `DELETE FROM feedback WHERE id IN (${placeholders})`;

  pool.query(query, ids, (err, result) => {
    if (err) {
      console.error("Error bulk deleting feedbacks:", err);
      return res.status(500).json({
        success: false,
        message: "Error bulk deleting feedbacks",
      });
    }

    res.status(200).json({
      success: true,
      message: `${result.rowCount} feedbacks deleted successfully`,
    });
  });
});

// ==========================
// Update your existing GET /api/feedback query to include filtered_feedback
// ==========================
// Replace your existing query with:
/*
let query = `
  SELECT 
    f.id, 
    f.feedback, 
    f.filtered_feedback,
    f.is_verified, 
    f.created_at, 
    u.username 
  FROM feedback f
  JOIN users u ON f.user_id = u.id
`;
*/

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
