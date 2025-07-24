// Authentication functionality
// Configuration for API base URL
const API_BASE_URL = "https://exploremore-production-c375.up.railway.app"; // For production
// const API_BASE_URL = 'http://localhost:3001'; // For local testing

document.addEventListener("DOMContentLoaded", function () {
  initializeAuth();
});

function initializeAuth() {
  // Handle signup form
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);

    // Add real-time validation
    const inputs = signupForm.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("blur", validateField);
      input.addEventListener("input", clearFieldError);
    });
  }

  // Handle login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // Check authentication status on page load
  checkAuthStatus();
}

// Signup validation functions
function validateField(event) {
  const field = event.target;
  const fieldName = field.name;
  const value = field.value.trim();

  switch (fieldName) {
    case "username":
      validateUsername(value);
      break;
    case "email":
      validateEmail(value);
      break;
    case "password":
      validatePassword(value);
      break;
    case "confirmPassword":
      validateConfirmPassword(value);
      break;
  }
}

function validateUsername(username) {
  const usernameError = document.getElementById("usernameError");
  const usernameField = document.getElementById("username");

  if (username.length < 3 || username.length > 20) {
    showFieldError(
      "usernameError",
      "Username must be between 3 and 20 characters"
    );
    usernameField.classList.add("error");
    usernameField.classList.remove("success");
    return false;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    showFieldError(
      "usernameError",
      "Username can only contain letters, numbers, and underscores"
    );
    usernameField.classList.add("error");
    usernameField.classList.remove("success");
    return false;
  }

  hideFieldError("usernameError");
  usernameField.classList.remove("error");
  usernameField.classList.add("success");
  return true;
}

function validateEmail(email) {
  const emailError = document.getElementById("emailError");
  const emailField = document.getElementById("email");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    showFieldError("emailError", "Please enter a valid email address");
    emailField.classList.add("error");
    emailField.classList.remove("success");
    return false;
  }

  hideFieldError("emailError");
  emailField.classList.remove("error");
  emailField.classList.add("success");
  return true;
}

function validatePassword(password) {
  const passwordError = document.getElementById("passwordError");
  const passwordField = document.getElementById("password");

  if (password.length < 6) {
    showFieldError(
      "passwordError",
      "Password must be at least 6 characters long"
    );
    passwordField.classList.add("error");
    passwordField.classList.remove("success");
    return false;
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    showFieldError(
      "passwordError",
      "Password does not meet minimum strength. Password must contain at least one uppercase letter, one lowercase letter, and one number"
    );
    passwordField.classList.add("error");
    passwordField.classList.remove("success");
    return false;
  }

  hideFieldError("passwordError");
  passwordField.classList.remove("error");
  passwordField.classList.add("success");
  return true;
}

function validateConfirmPassword(confirmPassword) {
  const confirmPasswordError = document.getElementById("confirmPasswordError");
  const confirmPasswordField = document.getElementById("confirmPassword");
  const password = document.getElementById("password").value;

  if (confirmPassword !== password) {
    showFieldError("confirmPasswordError", "Passwords do not match");
    confirmPasswordField.classList.add("error");
    confirmPasswordField.classList.remove("success");
    return false;
  }

  hideFieldError("confirmPasswordError");
  confirmPasswordField.classList.remove("error");
  confirmPasswordField.classList.add("success");
  return true;
}

function showFieldError(errorId, message) {
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add("show");
  }
}

function hideFieldError(errorId) {
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.classList.remove("show");
  }
}

function clearFieldError(event) {
  const field = event.target;
  field.classList.remove("error");
}

// Handle signup form submission
async function handleSignup(event) {
  event.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  const originalText = submitBtn.textContent;

  // Get form data
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Clear previous messages
  hideMessage("errorMessages");
  hideMessage("successMessage");

  // Validate all fields
  const isUsernameValid = validateUsername(username);
  const isEmailValid = validateEmail(email);
  const isPasswordValid = validatePassword(password);
  const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

  if (
    !isUsernameValid ||
    !isEmailValid ||
    !isPasswordValid ||
    !isConfirmPasswordValid
  ) {
    showMessage(
      "errorMessages",
      "Please fix the errors above before submitting."
    );
    return;
  }

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating Account...";

  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (data.success) {
      showMessage(
        "successMessage",
        "Account created successfully! You can now log in."
      );
      document.getElementById("signupForm").reset();

      // Clear field styles
      const inputs = document.querySelectorAll("#signupForm input");
      inputs.forEach((input) => {
        input.classList.remove("error", "success");
      });

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else {
      if (data.errors && data.errors.length > 0) {
        const errorMessages = data.errors.map((error) => error.msg).join(", ");
        showMessage("errorMessages", errorMessages);
      } else {
        showMessage(
          "errorMessages",
          data.message || "An error occurred during signup."
        );
      }
    }
  } catch (error) {
    console.error("Signup error:", error);
    showMessage("errorMessages", "Network error. Please try again.");
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// Handle login form submission
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const loginBtn = document.querySelector(".login-btn");
  const originalText = loginBtn.textContent;

  if (!email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";

  try {
    console.log("🔄 Attempting login to:", `${API_BASE_URL}/login`);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    console.log("📡 Response status:", response.status);
    console.log("📡 Response ok:", response.ok);

    const data = await response.json();
    console.log("📡 Response data:", data);

    if (data.success) {
      // Store user info in sessionStorage
      sessionStorage.setItem("user", JSON.stringify(data.user));

      // Show success message
      alert("Login successful! Welcome " + data.user.username);

      // Redirect to home page
      window.location.href = "index.html";
    } else {
      alert(data.message || "Login failed. Please check your credentials.");
    }
  } catch (error) {
    console.error("Login error details:", error);
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);

    // More specific error messages
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      alert(
        "Cannot connect to server. Please check:\n1. Your internet connection\n2. Server is running\n3. CORS is configured correctly"
      );
    } else if (error.name === "SyntaxError") {
      alert("Server returned invalid response. Please try again.");
    } else {
      alert("Network error. Please try again.\nError: " + error.message);
    }
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = originalText;
  }
}

// Check authentication status and update UI
// Check authentication status and update UI
function checkAuthStatus() {
  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  const loginButton = document.getElementById("loginButton");
  const signupButton = document.getElementById("signupButton");
  const logoutButton = document.getElementById("logoutButton");
  const dashboardButton = document.getElementById("dashboardButton");

  if (user && loginButton && signupButton && logoutButton) {
    // User is logged in
    loginButton.classList.add("d-none");
    signupButton.classList.add("d-none");
    logoutButton.classList.remove("d-none");
    logoutButton.textContent = `Logout`;

    // Show dashboard if user is admin
    if (user.role === "admin" && dashboardButton) {
      dashboardButton.classList.remove("d-none");
    }
  }
}

// Logout function
function logout() {
  sessionStorage.removeItem("user");

  const loginButton = document.getElementById("loginButton");
  const signupButton = document.getElementById("signupButton");
  const logoutButton = document.getElementById("logoutButton");
  const dashboardButton = document.getElementById("dashboardButton");

  if (loginButton && signupButton && logoutButton) {
    loginButton.classList.remove("d-none");
    signupButton.classList.remove("d-none");
    logoutButton.classList.add("d-none");
  }

  if (dashboardButton) {
    dashboardButton.classList.add("d-none");
  }

  const authMessage = document.getElementById("authMessage");
  if (authMessage) {
    authMessage.style.display = "none";
  }

  window.location.href = "index.html";
}

// Utility functions for showing/hiding messages
function showMessage(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.style.display = "block";
  }
}

function hideMessage(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = "none";
  }
}
