// Enhanced dash-feedback.js with profanity filtering features
// Add these functions to your existing dash-feedback.js file

// Configuration for API base URL
const API_BASE_URL = "https://exploremore-production-c375.up.railway.app"; // For production
// const API_BASE_URL = 'http://localhost:3001'; // For local testing

document.addEventListener("DOMContentLoaded", () => {
  loadFeedbackTable();
  initializeProfanityFeatures();

  // Attach filter events
  const applyFiltersBtn = document.getElementById("applyFiltersBtn");
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", loadFeedbackTable);
  }

  // Bulk action buttons
  const bulkVerifyBtn = document.getElementById("bulkVerifyBtn");
  const bulkUnverifyBtn = document.getElementById("bulkUnverifyBtn");
  const bulkDeleteBtn = document.getElementById("bulkDeleteBtn");

  if (bulkVerifyBtn) {
    bulkVerifyBtn.addEventListener("click", () => bulkAction("verify"));
  }
  if (bulkUnverifyBtn) {
    bulkUnverifyBtn.addEventListener("click", () => bulkAction("unverify"));
  }
  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener("click", () => bulkAction("delete"));
  }
});

// NEW: Initialize profanity-related features
function initializeProfanityFeatures() {
  // Add refilter button functionality if it exists
  const refilterBtn = document.getElementById("refilterBtn");
  if (refilterBtn) {
    refilterBtn.addEventListener("click", refilterAllFeedbacks);
  }

  // Add profanity stats refresh functionality
  const refreshStatsBtn = document.getElementById("refreshStatsBtn");
  if (refreshStatsBtn) {
    refreshStatsBtn.addEventListener("click", loadProfanityStats);
  }
}

// NEW: Refilter all existing feedbacks
function refilterAllFeedbacks() {
  if (!confirm("This will refilter all feedbacks for profanity. Continue?")) {
    return;
  }

  const refilterBtn = document.getElementById("refilterBtn");
  if (refilterBtn) {
    refilterBtn.disabled = true;
    refilterBtn.textContent = "Refiltering...";
  }

  fetch(`${API_BASE_URL}/api/feedback/refilter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include credentials for authentication
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((response) => {
      alert(
        `Refiltering completed! Processed: ${response.processed}, Updated: ${response.updated}`
      );
      loadFeedbackTable(); // Refresh the table
    })
    .catch((err) => {
      console.error("Error refiltering feedbacks:", err);
      alert("Failed to refilter feedbacks");
    })
    .finally(() => {
      if (refilterBtn) {
        refilterBtn.disabled = false;
        refilterBtn.textContent = "Refilter All";
      }
    });
}

// NEW: Load profanity statistics
function loadProfanityStats() {
  fetch(`${API_BASE_URL}/api/feedback/profanity-stats`, {
    credentials: "include", // Include credentials for authentication
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((response) => {
      const stats = response.data;
      updateProfanityStats(stats);
    })
    .catch((err) => {
      console.error("Error loading profanity stats:", err);
    });
}

// NEW: Update profanity statistics in UI
function updateProfanityStats(stats) {
  const elements = {
    statTotalProfane: stats.totalProfane || 0,
    statVerifiedProfane: stats.verifiedProfane || 0,
    statUnverifiedProfane: stats.unverifiedProfane || 0,
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.innerText = value;
    }
  });
}

// ENHANCED: Updated renderFeedbackTable function with profanity indicators
function renderFeedbackTable(feedbacks) {
  const container = document.getElementById("feedbackTableContainer");
  if (!container) {
    console.error("feedbackTableContainer not found");
    return;
  }

  console.log("Rendering feedbacks:", feedbacks); // Debug log

  container.innerHTML = `
    <table class="table table-bordered table-striped">
      <thead class="table-dark">
        <tr>
          <th><input type="checkbox" id="selectAll"></th>
          <th>Username</th>
          <th>Original</th>
          <th>Filtered</th>
          <th>Status</th>
          <th>Profanity</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${feedbacks
          .map((fb) => {
            const hasProfanity = fb.feedback !== fb.filtered_feedback;
            return `
            <tr data-id="${fb.id}">
              <td><input type="checkbox" class="select-row"></td>
              <td>${escapeHtml(fb.username || "N/A")}</td>
              <td>${escapeHtml(fb.feedback || "N/A")}</td>
              <td>${escapeHtml(fb.filtered_feedback || "N/A")}</td>
              <td><span class="badge ${
                fb.is_verified ? "bg-success" : "bg-secondary"
              }">${fb.is_verified ? "Verified" : "Unverified"}</span></td>
              <td><span class="badge ${
                hasProfanity ? "bg-danger" : "bg-success"
              }">${hasProfanity ? "Filtered" : "Clean"}</span></td>
              <td>${new Date(fb.created_at).toLocaleString()}</td>
              <td>
                <button class="btn btn-sm btn-warning toggle-btn">Toggle</button>
                <button class="btn btn-sm btn-danger delete-btn">Delete</button>
              </td>
            </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  `;

  // Select all checkbox functionality
  const selectAllCheckbox = document.getElementById("selectAll");
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", (e) => {
      document
        .querySelectorAll(".select-row")
        .forEach((cb) => (cb.checked = e.target.checked));
    });
  }

  // Toggle button functionality
  container.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest("tr").dataset.id;
      if (!id) {
        console.error("No ID found for toggle action");
        return;
      }

      fetch(`${API_BASE_URL}/api/feedbacks/toggle/${id}`, {
        method: "POST",
        credentials: "include", // Include credentials for authentication
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(() => {
          loadFeedbackTable();
        })
        .catch((err) => {
          console.error("Error toggling feedback:", err);
          alert("Failed to toggle feedback status");
        });
    });
  });

  // Delete button functionality
  container.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest("tr").dataset.id;
      if (!id) {
        console.error("No ID found for delete action");
        return;
      }

      if (confirm("Are you sure you want to delete this feedback?")) {
        fetch(`${API_BASE_URL}/api/feedbacks/delete/${id}`, {
          method: "DELETE",
          credentials: "include", // Include credentials for authentication
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then(() => {
            loadFeedbackTable();
          })
          .catch((err) => {
            console.error("Error deleting feedback:", err);
            alert("Failed to delete feedback");
          });
      }
    });
  });
}

// Your existing functions remain unchanged:
// - loadFeedbackTable()
// - bulkAction()
// - updateStats()
// - escapeHtml()

// ENHANCED: Load feedback table with profanity stats
function loadFeedbackTable() {
  const search = document.getElementById("searchInput")?.value || "";
  const user = document.getElementById("userSelect")?.value || "";
  const status = document.getElementById("statusSelect")?.value || "";
  const date = document.getElementById("dateSelect")?.value || "";
  const profanity = document.getElementById("profanitySelect")?.value || "";

  const params = new URLSearchParams({ search, user, status, date, profanity });
  const url = `${API_BASE_URL}/api/feedback?${params.toString()}`;

  console.log("Making request to:", url); // Debug log

  fetch(url, {
    credentials: "include", // Include credentials for authentication
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(
          `HTTP error! status: ${res.status} - ${res.statusText}`
        );
      }
      return res.json();
    })
    .then((response) => {
      console.log("API Response:", response); // Debug log

      let feedbacks;
      if (response.success && response.data) {
        feedbacks = response.data;
      } else if (Array.isArray(response)) {
        feedbacks = response;
      } else {
        throw new Error("Invalid response format");
      }

      if (profanity === "clean") {
        feedbacks = feedbacks.filter(
          (fb) => fb.feedback === fb.filtered_feedback
        );
      } else if (profanity === "filtered") {
        feedbacks = feedbacks.filter(
          (fb) => fb.feedback !== fb.filtered_feedback
        );
      }
      if (feedbacks.length === 0) {
        document.getElementById("feedbackTableContainer").innerHTML =
          "<p>No feedbacks found.</p>";
      } else {
        renderFeedbackTable(feedbacks);
      }
    })
    .catch((err) => {
      console.error("Error loading feedbacks:", err);
      document.getElementById(
        "feedbackTableContainer"
      ).innerHTML = `<p class="text-danger">Error loading feedbacks: ${err.message}</p>`;
    });

  // Load regular stats
  fetch(`${API_BASE_URL}/api/stats`, {
    credentials: "include", // Include credentials for authentication
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((response) => {
      const stats = response.data || response;
      updateStats(stats);
    })
    .catch((err) => {
      console.error("Error loading stats:", err);
      updateStats({
        total: 0,
        verified: 0,
        unverified: 0,
        filtered: 0,
      });
    });

  // Load profanity stats
  loadProfanityStats();
}

function bulkAction(action) {
  const selectedIds = [...document.querySelectorAll(".select-row:checked")]
    .map((cb) => cb.closest("tr").dataset.id)
    .filter((id) => id);

  if (!selectedIds.length) {
    alert("No feedbacks selected.");
    return;
  }

  if (
    !confirm(
      `Are you sure you want to ${action} ${selectedIds.length} selected feedback(s)?`
    )
  ) {
    return;
  }

  fetch(`${API_BASE_URL}/api/feedbacks/bulk-${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids: selectedIds }),
    credentials: "include", // Include credentials for authentication
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(() => {
      loadFeedbackTable();
    })
    .catch((err) => {
      console.error("Error performing bulk action:", err);
      alert(`Failed to perform bulk ${action}`);
    });
}

function updateStats(stats) {
  const elements = {
    statTotal: stats.total || 0,
    statVerified: stats.verified || 0,
    statUnverified: stats.unverified || 0,
    statFiltered: stats.filtered || 0,
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.innerText = value;
    } else {
      console.warn(`Element with ID ${id} not found`);
    }
  });
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
