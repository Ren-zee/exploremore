/**
 * Modern Notification System for ExploreMore Dashboard
 * Usage: showNotification(type, title, message, duration)
 * Types: 'success', 'error', 'warning', 'info'
 */

// Modern Notification System
function showNotification(type, title, message, duration = 5000) {
  // Create container if it doesn't exist
  let container = document.getElementById("notification-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    container.className = "notification-container";
    document.body.appendChild(container);
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;

  // Icons for different types
  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  notification.innerHTML = `
    <span class="notification-icon">${icons[type] || "ℹ"}</span>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close" onclick="hideNotification(this.parentElement)">×</button>
  `;

  // Add to container
  container.appendChild(notification);

  // Show with animation
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Auto hide after duration
  setTimeout(() => {
    hideNotification(notification);
  }, duration);

  return notification;
}

function hideNotification(notification) {
  if (!notification) return;

  notification.classList.remove("show");
  notification.classList.add("hide");

  setTimeout(() => {
    if (notification.parentElement) {
      notification.parentElement.removeChild(notification);
    }
  }, 300);
}

// Convenience methods for different notification types
function showSuccess(title, message, duration = 3000) {
  return showNotification("success", title, message, duration);
}

function showError(title, message, duration = 7000) {
  return showNotification("error", title, message, duration);
}

function showWarning(title, message, duration = 5000) {
  return showNotification("warning", title, message, duration);
}

function showInfo(title, message, duration = 4000) {
  return showNotification("info", title, message, duration);
}

// Fallback for environments without notification support
function fallbackAlert(type, title, message) {
  alert(`${type.toUpperCase()}: ${title}\n${message}`);
}

// Initialize notification system
document.addEventListener("DOMContentLoaded", function () {
  // Ensure container exists
  if (!document.getElementById("notification-container")) {
    const container = document.createElement("div");
    container.id = "notification-container";
    container.className = "notification-container";
    document.body.appendChild(container);
  }
});
