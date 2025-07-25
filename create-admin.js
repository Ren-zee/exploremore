// Script to create an admin account
require("dotenv").config();
const bcrypt = require("bcrypt");

async function createAdminAccount() {
  try {
    // Check if database config is available
    const connString =
      process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

    if (!connString) {
      console.log("❌ Database connection not configured!");
      console.log("\n📋 To create an admin account:");
      console.log("1. Copy .env.example to .env");
      console.log("2. Add your database URL to the .env file");
      console.log("3. Run this script again: node create-admin.js");
      console.log(
        "\n🔧 Alternatively, you can create the admin manually through your database:"
      );

      const adminPassword = "Admin123!";
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      console.log("\n📝 Manual SQL to create admin account:");
      console.log(
        "INSERT INTO users (username, email, password_hash, role) VALUES"
      );
      console.log(
        `('admin', 'admin@exploremore.ph', '${hashedPassword}', 'admin');`
      );
      console.log("\n🔑 Admin Credentials:");
      console.log("📧 Email: admin@exploremore.ph");
      console.log("👤 Username: admin");
      console.log("🔑 Password: Admin123!");
      return;
    }

    const pool = require("./config/db");

    const adminUsername = "admin";
    const adminEmail = "admin@exploremore.ph";
    const adminPassword = "Admin123!"; // You should change this password after first login

    console.log("Creating admin account...");

    // Check if admin already exists
    const checkQuery = "SELECT id FROM users WHERE email = $1 OR username = $2";
    const checkResult = await pool.query(checkQuery, [
      adminEmail,
      adminUsername,
    ]);

    if (checkResult.rows.length > 0) {
      console.log("Admin account already exists!");

      // Update existing user to admin role
      const updateQuery =
        "UPDATE users SET role = 'admin' WHERE email = $1 OR username = $2";
      await pool.query(updateQuery, [adminEmail, adminUsername]);
      console.log("Updated existing user to admin role.");
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Insert admin user
    const insertQuery =
      "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id";
    const result = await pool.query(insertQuery, [
      adminUsername,
      adminEmail,
      hashedPassword,
      "admin",
    ]);

    console.log("✅ Admin account created successfully!");
    console.log("📧 Email:", adminEmail);
    console.log("👤 Username:", adminUsername);
    console.log("🔑 Password:", adminPassword);
    console.log("🆔 User ID:", result.rows[0].id);
    console.log(
      "\n⚠️  IMPORTANT: Please change the admin password after first login!"
    );
  } catch (error) {
    console.error("❌ Error creating admin account:", error.message);

    if (error.message.includes("Database connection")) {
      console.log("\n💡 Make sure your database is running and accessible.");
      console.log("💡 Check your .env file for correct database credentials.");
    }
  } finally {
    process.exit();
  }
}

createAdminAccount();
