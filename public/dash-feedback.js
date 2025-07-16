document.addEventListener("DOMContentLoaded", () => {
  loadFeedbackTable();

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

function loadFeedbackTable() {
  const search = document.getElementById("searchInput")?.value || "";
  const user = document.getElementById("userSelect")?.value || "";
  const status = document.getElementById("statusSelect")?.value || "";
  const date = document.getElementById("dateSelect")?.value || "";

  const params = new URLSearchParams({ search, user, status, date });
  // Configuration for API base URL
  const API_BASE_URL = ''; // Empty for relative URLs when serving from same server
  const url = `${API_BASE_URL}/api/feedback?${params.toString()}`;
  
  console.log("Making request to:", url); // Debug log
  console.log("Current location:", window.location.href); // Debug log

  fetch(url)
    .then(res => {
      console.log("Response status:", res.status); // Debug log
      console.log("Response ok:", res.ok); // Debug log
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`);
      }
      return res.json();
    })
    .then(response => {
      console.log("API Response:", response); // Debug log
      
      // Handle the structured response format
      let feedbacks;
      if (response.success && response.data) {
        feedbacks = response.data;
      } else if (Array.isArray(response)) {
        feedbacks = response;
      } else {
        throw new Error("Invalid response format");
      }

      if (feedbacks.length === 0) {
        document.getElementById("feedbackTableContainer").innerHTML = "<p>No feedbacks found.</p>";
      } else {
        renderFeedbackTable(feedbacks);
      }
    })
    .catch(err => {
      console.error("Error loading feedbacks:", err);
      document.getElementById("feedbackTableContainer").innerHTML = `<p class="text-danger">Error loading feedbacks: ${err.message}</p>`;
    });

  // Load stats
  fetch(`${API_BASE_URL}/api/stats`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(response => {
      console.log("Stats Response:", response); // Debug log
      
      // Handle both structured and direct response formats
      const stats = response.data || response;
      updateStats(stats);
    })
    .catch(err => {
      console.error("Error loading stats:", err);
      // Set default values on error
      updateStats({
        total: 0,
        verified: 0,
        unverified: 0,
        filtered: 0
      });
    });
}

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
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${feedbacks.map(fb => `
          <tr data-id="${fb.id}">
            <td><input type="checkbox" class="select-row"></td>
            <td>${escapeHtml(fb.username || 'N/A')}</td>
            <td>${escapeHtml(fb.feedback || 'N/A')}</td>
            <td>${escapeHtml(fb.filtered_feedback || 'N/A')}</td>
            <td><span class="badge ${fb.is_verified ? 'bg-success' : 'bg-secondary'}">${fb.is_verified ? 'Verified' : 'Unverified'}</span></td>
            <td>${new Date(fb.created_at).toLocaleString()}</td>
            <td>
              <button class="btn btn-sm btn-warning toggle-btn">Toggle</button>
              <button class="btn btn-sm btn-danger delete-btn">Delete</button>
            </td>
          </tr>`).join("")}
      </tbody>
    </table>
  `;

  // Select all checkbox functionality
  const selectAllCheckbox = document.getElementById("selectAll");
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", (e) => {
      document.querySelectorAll(".select-row").forEach(cb => cb.checked = e.target.checked);
    });
  }

  // Toggle button functionality
  container.querySelectorAll(".toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.closest("tr").dataset.id;
      if (!id) {
        console.error("No ID found for toggle action");
        return;
      }
      
      fetch(`${API_BASE_URL}/api/feedbacks/toggle/${id}`, {
        method: "POST"
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(() => {
          loadFeedbackTable();
        })
        .catch(err => {
          console.error("Error toggling feedback:", err);
          alert("Failed to toggle feedback status");
        });
    });
  });

  // Delete button functionality
  container.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.closest("tr").dataset.id;
      if (!id) {
        console.error("No ID found for delete action");
        return;
      }
      
      if (confirm("Are you sure you want to delete this feedback?")) {
        fetch(`${API_BASE_URL}/api/feedbacks/delete/${id}`, {
          method: "DELETE"
        })
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then(() => {
            loadFeedbackTable();
          })
          .catch(err => {
            console.error("Error deleting feedback:", err);
            alert("Failed to delete feedback");
          });
      }
    });
  });
}

function bulkAction(action) {
  const selectedIds = [...document.querySelectorAll(".select-row:checked")]
    .map(cb => cb.closest("tr").dataset.id)
    .filter(id => id); // Remove any undefined IDs

  if (!selectedIds.length) {
    alert("No feedbacks selected.");
    return;
  }

  if (!confirm(`Are you sure you want to ${action} ${selectedIds.length} selected feedback(s)?`)) {
    return;
  }

  fetch(`${API_BASE_URL}/api/feedbacks/bulk-${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ ids: selectedIds })
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(() => {
      loadFeedbackTable();
    })
    .catch(err => {
      console.error("Error performing bulk action:", err);
      alert(`Failed to perform bulk ${action}`);
    });
}

function updateStats(stats) {
  const elements = {
    statTotal: stats.total || 0,
    statVerified: stats.verified || 0,
    statUnverified: stats.unverified || 0,
    statFiltered: stats.filtered || 0
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

// Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}