// Debug script to help troubleshoot network issues
// Add this temporarily to your auth.js or run in browser console

async function debugNetworkIssue() {
  const API_BASE_URL = "https://exploremore-production-c375.up.railway.app";

  console.log("🔍 Starting network diagnostic...");
  console.log("📍 Current location:", window.location.href);
  console.log("🌐 API Base URL:", API_BASE_URL);

  // Test 1: Check if the API server is reachable
  try {
    console.log("🧪 Test 1: Checking server health...");
    const healthResponse = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log("✅ Server is reachable:", healthData);
    } else {
      console.log(
        "⚠️ Server health check failed:",
        healthResponse.status,
        healthResponse.statusText
      );
    }
  } catch (error) {
    console.log("❌ Server is not reachable:", error.message);
    console.log("🔍 This could be a CORS issue or server is down");
  }

  // Test 2: Check CORS headers
  try {
    console.log("🧪 Test 2: Testing CORS with OPTIONS request...");
    const corsResponse = await fetch(`${API_BASE_URL}/login`, {
      method: "OPTIONS",
    });
    console.log("📋 CORS response status:", corsResponse.status);
    console.log("📋 CORS headers:", [...corsResponse.headers.entries()]);
  } catch (error) {
    console.log("❌ CORS test failed:", error.message);
  }

  // Test 3: Try a simple login request
  try {
    console.log("🧪 Test 3: Testing login endpoint...");
    const loginResponse = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@test.com",
        password: "test123",
      }),
    });

    console.log("📋 Login response status:", loginResponse.status);
    console.log("📋 Login response headers:", [
      ...loginResponse.headers.entries(),
    ]);

    const loginData = await loginResponse.text();
    console.log("📋 Login response body:", loginData);
  } catch (error) {
    console.log("❌ Login test failed:", error.message);
    console.log("🔍 Error details:", error);
  }

  console.log("✅ Network diagnostic complete!");
}

// Run the diagnostic
debugNetworkIssue();
