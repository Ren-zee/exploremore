// Configuration for API base URL (using global config)
// Note: API_BASE_URL is now available globally through window.ExploreMoreConfig.API_BASE_URL

let users = [];
let currentSortColumn = "username";
let currentSortOrder = "asc";

// Filters
let searchTerm = "";
let selectedMonth = "";
let selectedDate = "";

function renderTable(data) {
  console.log("🎨 Rendering table with", data.length, "users");
  const tbody = document.getElementById("userTableBody");
  if (!tbody) {
    console.error("❌ Table body element not found!");
    return;
  }

  tbody.innerHTML = "";
  data.forEach((user, index) => {
    console.log(`👤 Rendering user ${index + 1}:`, user);
    const row = `
      <tr>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${new Date(user.created_at).toLocaleString()}</td>
        <td>${user.feedback_count}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", row);
  });
  console.log("✅ Table rendered successfully");
}

function updateSortIndicators() {
  document.querySelectorAll(".sort-arrow").forEach((span) => {
    const col = span.dataset.col;
    if (col === currentSortColumn) {
      span.innerText = currentSortOrder === "asc" ? "▲" : "▼";
      span.classList.add("active");
    } else {
      span.innerText = "▲▼";
      span.classList.remove("active");
    }
  });
}

function sortTable(column) {
  if (currentSortColumn === column) {
    currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
  } else {
    currentSortColumn = column;
    currentSortOrder = "asc";
  }

  applyFiltersAndSort();
  updateSortIndicators();
}

function applyFiltersAndSort() {
  console.log("🔍 Applying filters and sort to", users.length, "users");
  let filtered = users.filter((user) => {
    const lowerUsername = user.username.toLowerCase();
    const lowerEmail = user.email.toLowerCase();
    const createdDate = new Date(user.created_at);

    // Search term filter
    const matchesSearch =
      lowerUsername.includes(searchTerm) || lowerEmail.includes(searchTerm);

    // Month filter (format: yyyy-mm)
    const matchesMonth = selectedMonth
      ? createdDate.toISOString().startsWith(selectedMonth)
      : true;

    // Exact date filter (format: yyyy-mm-dd)
    const matchesDate = selectedDate
      ? createdDate.toISOString().split("T")[0] === selectedDate
      : true;

    return matchesSearch && matchesMonth && matchesDate;
  });

  console.log("📊 Filtered users:", filtered.length);

  const sorted = filtered.sort((a, b) => {
    let valA = a[currentSortColumn];
    let valB = b[currentSortColumn];

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (currentSortColumn === "created_at") {
      valA = new Date(valA);
      valB = new Date(valB);
    }

    if (valA < valB) return currentSortOrder === "asc" ? -1 : 1;
    if (valA > valB) return currentSortOrder === "asc" ? 1 : -1;
    return 0;
  });

  console.log("📈 Sorted users:", sorted.length);
  renderTable(sorted);
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("🔄 Dashboard Users: Starting to load users...");
  const API_BASE_URL =
    window.ExploreMoreConfig?.API_BASE_URL ||
    "https://exploremore-production-c375.up.railway.app";
  console.log("🌐 API URL:", `${API_BASE_URL}/api/users-with-feedback`);

  fetch(`${API_BASE_URL}/api/users-with-feedback`, {
    credentials: "include", // Include credentials for authentication
  })
    .then((res) => {
      console.log("📡 Response status:", res.status);
      console.log("📡 Response headers:", res.headers);
      if (!res.ok) {
        throw new Error(
          `HTTP error! status: ${res.status} - ${res.statusText}`
        );
      }
      return res.json();
    })
    .then((data) => {
      console.log("📦 Received data:", data);
      if (data.success) {
        console.log(
          "✅ Users loaded successfully:",
          data.users.length,
          "users"
        );
        users = data.users;
        applyFiltersAndSort(); // initial render
      } else {
        console.error("❌ Failed to load users:", data.message);
        alert("Failed to load users: " + (data.message || "Unknown error"));
      }
    })
    .catch((err) => {
      console.error("💥 Error loading users:", err);
      alert("Error loading users: " + err.message);
    });

  // Sort arrow click
  document.querySelectorAll(".sort-arrow").forEach((span) => {
    span.addEventListener("click", () => sortTable(span.dataset.col));
  });

  // Search input
  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    applyFiltersAndSort();
  });

  // Month filter
  document.getElementById("monthFilter").addEventListener("change", (e) => {
    selectedMonth = e.target.value;
    applyFiltersAndSort();
  });

  // Date filter
  document.getElementById("dateFilter").addEventListener("change", (e) => {
    selectedDate = e.target.value;
    applyFiltersAndSort();
  });

  // Clear filters
  document.getElementById("clearFilters").addEventListener("click", () => {
    searchTerm = "";
    selectedMonth = "";
    selectedDate = "";
    document.getElementById("searchInput").value = "";
    document.getElementById("monthFilter").value = "";
    document.getElementById("dateFilter").value = "";
    applyFiltersAndSort();
  });
});
