require("dotenv").config();
const { Pool } = require("pg");

// Parse the connection string manually for better control
const connString =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!connString) {
  throw new Error(
    "Database connection string not found in environment variables"
  );
}

// Extract components from URL
const url = new URL(connString);
const config = {
  host: url.hostname,
  port: parseInt(url.port),
  user: url.username,
  password: url.password,
  database: url.pathname.substring(1), // Remove leading /
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false, require: true }
      : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

const pool = new Pool(config);

// Test connection on startup
pool.on("connect", () => {
  console.log("✅ Database connected successfully");
});

pool.on("error", (err) => {
  console.error("❌ Database connection error:", err);
});

module.exports = pool;