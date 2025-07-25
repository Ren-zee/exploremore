// Configuration for API base URL (using global config)
// Note: API_BASE_URL is now available globally through window.ExploreMoreConfig.API_BASE_URL

// Helper function to get API base URL
function getApiBaseUrl() {
  return (
    window.ExploreMoreConfig?.API_BASE_URL ||
    "https://exploremore-production-c375.up.railway.app"
  );
}

// Feedback functionality
document.addEventListener("DOMContentLoaded", function () {
  initializeFeedback();
});

function initializeFeedback() {
  // Handle feedback form
  const feedbackForm = document.getElementById("feedbackForm");
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", handleFeedbackSubmission);
  }

  // Check authentication status on page load
  checkFeedbackAuth();

  // Load and display existing feedbacks
  loadFeedbacks();
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
    const API_BASE_URL = getApiBaseUrl();

    // Debug: Log the current user and authentication status
    console.log("🔍 Current user from sessionStorage:", user);
    console.log("🔍 API_BASE_URL:", API_BASE_URL);

    // First, check auth status with the server
    try {
      const authCheck = await fetch(`${API_BASE_URL}/api/auth-status`, {
        method: "GET",
        credentials: "include",
      });
      const authData = await authCheck.json();
      console.log("🔍 Server auth status:", authData);
    } catch (authError) {
      console.log("🔍 Auth status check failed:", authError);
    }

    const response = await fetch(`${API_BASE_URL}/submit-feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add user info to headers as a fallback for cross-domain issues
        "X-User-Id": user.id,
        "X-User-Email": user.email,
      },
      body: JSON.stringify({
        feedback: feedbackText,
        userId: user.id, // Include user ID in body as well
        userEmail: user.email, // Include user email as fallback
      }),
      credentials: "include", // Include session cookies
    });

    console.log("🔍 Response status:", response.status);
    console.log("🔍 Response ok:", response.ok);

    const data = await response.json();
    console.log("🔍 Response data:", data);

    if (response.status === 401) {
      // Clear potentially invalid session data and redirect to login
      sessionStorage.removeItem("user");
      showFeedbackMessage(
        "Your session has expired. Please log in again to submit feedback.",
        "warning"
      );
      setTimeout(() => {
        window.location.href = "login.html";
      }, 3000);
      return;
    }

    if (data.success) {
      showFeedbackMessage(
        "Thank you! Your feedback has been submitted and is pending admin approval.",
        "success"
      );
      feedbackTextarea.value = ""; // Clear the form

      // Don't refresh feedbacks display since unverified feedbacks shouldn't show
      // Only verified feedbacks will be displayed

      // Hide success message after 8 seconds
      setTimeout(() => {
        hideFeedbackMessage();
      }, 8000);
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

// Load and display feedbacks from database
async function loadFeedbacks() {
  const feedbacksContainer = document.getElementById("feedbacksDisplay");
  if (!feedbacksContainer) {
    return;
  }

  try {
    const API_BASE_URL = getApiBaseUrl();
    const response = await fetch(
      `${API_BASE_URL}/get-feedbacks?verified=true`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.feedbacks) {
      displayFeedbacks(data.feedbacks);
    } else {
      feedbacksContainer.innerHTML =
        '<p class="text-center text-muted">No feedbacks available yet.</p>';
    }
  } catch (error) {
    console.error("Error loading feedbacks:", error);
    feedbacksContainer.innerHTML =
      '<p class="text-center text-danger">Error loading feedbacks. Please try again later.</p>';
  }
}

function displayFeedbacks(feedbacks) {
  console.log("displayFeedbacks called with", feedbacks.length, "feedbacks");

  const feedbacksContainer = document.getElementById("feedbacksDisplay");
  if (!feedbacksContainer) {
    console.log("feedbacksDisplay container not found!");
    return;
  }

  console.log("Container found:", feedbacksContainer);

  if (feedbacks.length === 0) {
    feedbacksContainer.innerHTML = `
      <div class="text-center text-muted p-4">
        <h5>No verified feedbacks available yet.</h5>
        <p>Feedbacks are reviewed by our admin team before being displayed here.</p>
      </div>
    `;
    return;
  }

  const feedbacksHTML = feedbacks
    .map(
      (feedback) => `
    <div class="feedback-item">
      <div class="feedback-header">
        <strong class="feedback-username">${escapeHtml(
          feedback.username || "Anonymous"
        )}</strong>
        <span class="feedback-date">${formatDate(feedback.created_at)}</span>
        <span class="badge bg-success ms-2">Verified</span>
      </div>
      <div class="feedback-content">
        ${escapeHtml(feedback.filtered_feedback || feedback.feedback)}
      </div>
    </div>
  `
    )
    .join("");

  console.log("Setting innerHTML to:", feedbacksHTML.substring(0, 100) + "...");
  feedbacksContainer.innerHTML = feedbacksHTML;
  console.log("innerHTML set successfully");
}

// Utility function to escape HTML to prevent XSS attacks
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Utility function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Refresh feedbacks after successful submission
function refreshFeedbacks() {
  loadFeedbacks();
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

// Test function to verify the container works
function testFeedbackDisplay() {
  const feedbacksContainer = document.getElementById("feedbacksDisplay");
  if (feedbacksContainer) {
    feedbacksContainer.innerHTML =
      '<div style="background: red; color: white; padding: 10px;">TEST - Container is working!</div>';
    console.log("Test HTML added to container");
  } else {
    console.log("Container not found");
  }
}
