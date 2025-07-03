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

      // Refresh the feedbacks display
      refreshFeedbacks();

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

// Load and display feedbacks from database
async function loadFeedbacks() {
  const feedbacksContainer = document.getElementById("feedbacksDisplay");
  if (!feedbacksContainer) {
    return;
  }

  try {
    const response = await fetch("/get-feedbacks", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

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
    feedbacksContainer.innerHTML =
      '<p class="text-center text-muted">No feedbacks available yet.</p>';
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
      </div>
      <div class="feedback-content">
        ${escapeHtml(feedback.feedback)}
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
