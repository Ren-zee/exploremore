// Test the registration endpoint directly
const fetch = require("node-fetch"); // You might need to install this: npm install node-fetch

async function testRegistration() {
  const API_BASE_URL = "http://localhost:3001";

  console.log("🧪 Testing registration endpoint...");

  const testUser = {
    username: "testuser123",
    email: "testuser123@example.com",
    password: "Test123!",
  };

  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUser),
    });

    console.log("📋 Response status:", response.status);
    console.log("📋 Response headers:", [...response.headers.entries()]);

    const data = await response.text();
    console.log("📋 Response body:", data);

    // Try to parse as JSON
    try {
      const jsonData = JSON.parse(data);
      console.log("📋 Parsed JSON:", jsonData);
    } catch (e) {
      console.log("⚠️ Response is not valid JSON");
    }
  } catch (error) {
    console.error("❌ Registration test failed:", error.message);
  }
}

testRegistration();
