// Authentication functionality
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

  // Handle feedback form
  const feedbackForm = document.getElementById("feedbackForm");
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", handleFeedbackSubmission);
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
    const response = await fetch("/signup", {
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
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Store user info in sessionStorage
      sessionStorage.setItem("user", JSON.stringify(data.user));

      // Show success message
      alert("Login successful! Welcome " + data.user.username);

      // Redirect to home page
      window.location.href = "index.html";
    } else {
      alert("Account does not exist.");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Network error. Please try again.");
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = originalText;
  }
}

// Check authentication status and update UI
function checkAuthStatus() {
  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  const loginButton = document.getElementById("loginButton");
  const signupButton = document.getElementById("signupButton");
  const logoutButton = document.getElementById("logoutButton");

  if (user && loginButton && signupButton && logoutButton) {
    // User is logged in
    loginButton.classList.add("d-none");
    signupButton.classList.add("d-none");
    logoutButton.classList.remove("d-none");
    logoutButton.textContent = `Logout`;
  }

  // Also check feedback authentication status
  checkFeedbackAuth();
}

// Logout function
function logout() {
  sessionStorage.removeItem("user");

  // Update UI
  const loginButton = document.getElementById("loginButton");
  const signupButton = document.getElementById("signupButton");
  const logoutButton = document.getElementById("logoutButton");

  if (loginButton && signupButton && logoutButton) {
    loginButton.classList.remove("d-none");
    signupButton.classList.remove("d-none");
    logoutButton.classList.add("d-none");
  }

  // Hide any auth or feedback messages
  const authMessage = document.getElementById("authMessage");
  if (authMessage) {
    authMessage.style.display = "none";
  }
  hideFeedbackMessage();

  // Update feedback form status
  checkFeedbackAuth();

  // Redirect to home page
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

// Feedback functionality
function checkFeedbackAuth() {
  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  const authMessage = document.getElementById("authMessage");
  const feedbackForm = document.getElementById("feedbackForm");

  if (feedbackForm) {
    if (!user) {
      // User not logged in - hide auth message
      if (authMessage) {
        authMessage.style.display = "none";
      }
      feedbackForm.style.opacity = "1";
      feedbackForm.style.pointerEvents = "auto";
    } else {
      // User logged in - hide auth message, enable form
      if (authMessage) {
        authMessage.style.display = "none";
      }
      feedbackForm.style.opacity = "1";
      feedbackForm.style.pointerEvents = "auto";
    }
  }
}

async function handleFeedbackSubmission(event) {
  event.preventDefault();

  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  if (!user) {
    // Show the authentication message when user tries to submit
    const authMessage = document.getElementById("authMessage");
    if (authMessage) {
      authMessage.style.display = "block";
    }
    showFeedbackMessage("You must be logged in to submit feedback.", "warning");
    return;
  }

  const feedbackTextarea = document.getElementById("feedback");
  const submitBtn = document.getElementById("submitFeedbackBtn");
  const feedbackText = feedbackTextarea.value.trim();

  if (!feedbackText) {
    showFeedbackMessage(
      "Please enter your feedback before submitting.",
      "error"
    );
    return;
  }

  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    const response = await fetch("/submit-feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feedback: feedbackText,
      }),
      credentials: "include", // Include session cookies
    });

    const data = await response.json();

    if (data.success) {
      showFeedbackMessage(
        "Thank you! Your feedback has been submitted.",
        "success"
      );
      feedbackTextarea.value = ""; // Clear the form

      // Hide success message after 5 seconds
      setTimeout(() => {
        hideFeedbackMessage();
      }, 5000);
    } else {
      if (data.errors && data.errors.length > 0) {
        const errorMessages = data.errors.map((error) => error.msg).join(", ");
        showFeedbackMessage(errorMessages, "error");
      } else {
        showFeedbackMessage(
          data.message || "An error occurred while submitting feedback.",
          "error"
        );
      }
    }
  } catch (error) {
    console.error("Feedback submission error:", error);
    showFeedbackMessage(
      "Network error. Please check your connection and try again.",
      "error"
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

function showFeedbackMessage(message, type) {
  const messageElement = document.getElementById("feedbackMessages");
  if (messageElement) {
    let className = "alert alert-danger"; // default to error
    if (type === "success") {
      className = "alert alert-success";
    } else if (type === "warning") {
      className = "alert alert-warning";
    }

    messageElement.className = className;
    messageElement.textContent = message;
    messageElement.style.display = "block";

    // Auto-hide error and warning messages after 8 seconds
    if (type === "error" || type === "warning") {
      setTimeout(() => {
        hideFeedbackMessage();
      }, 8000);
    }
  }
}

function hideFeedbackMessage() {
  const messageElement = document.getElementById("feedbackMessages");
  if (messageElement) {
    messageElement.style.display = "none";
  }
}
