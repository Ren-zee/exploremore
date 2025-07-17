// Alternative approach using direct configuration
require("dotenv").config();
const { Pool } = require("pg");

// Parse the connection string manually
const connString =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
console.log(
  "🔗 Original connection string:",
  connString.substring(0, 50) + "..."
);

// Extract components from URL
const url = new URL(connString);
const config = {
  host: url.hostname,
  port: parseInt(url.port),
  user: url.username,
  password: url.password,
  database: url.pathname.substring(1), // Remove leading /
  ssl: false, // Disable SSL for testing
};

console.log("📋 Parsed config:", {
  host: config.host,
  port: config.port,
  user: config.user,
  database: config.database,
  ssl: config.ssl,
});

const pool = new Pool(config);

async function testDatabase() {
  console.log("🔍 Testing database connection with manual config...");

  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully!");

    // Check if users table exists
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'feedback', 'price_breakdown')
    `);

    console.log(
      "📋 Found tables:",
      tablesResult.rows.map((row) => row.table_name)
    );

    client.release();
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
  } finally {
    await pool.end();
  }
}

testDatabase();
