// Test database connection and setup
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: (
    process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  ).replace("?sslmode=require", "?sslmode=prefer"),
  ssl: false,
});

async function testDatabase() {
  console.log("🔍 Testing database connection...");
  console.log(
    "📋 Using connection string:",
    (process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL).substring(
      0,
      50
    ) + "..."
  );

  try {
    // Test connection
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

    // If users table exists, check its structure
    if (tablesResult.rows.some((row) => row.table_name === "users")) {
      const usersStructure = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users'
      `);
      console.log("👤 Users table structure:", usersStructure.rows);

      // Check if we have any users
      const userCount = await client.query("SELECT COUNT(*) FROM users");
      console.log("👥 Number of users:", userCount.rows[0].count);
    } else {
      console.log("⚠️ Users table does not exist!");
    }

    client.release();
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    console.error("🔍 Full error:", error);
  } finally {
    await pool.end();
  }
}

testDatabase();
