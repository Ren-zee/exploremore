// Configuration for API base URL
const API_BASE_URL = "https://exploremore-production-c375.up.railway.app"; // For production
// const API_BASE_URL = 'http://localhost:3001'; // For local testing

let users = [];
let currentSortColumn = "username";
let currentSortOrder = "asc";

// Filters
let searchTerm = "";
let selectedMonth = "";
let selectedDate = "";

function renderTable(data) {
  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";
  data.forEach((user) => {
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

  renderTable(sorted);
}

document.addEventListener("DOMContentLoaded", () => {
  fetch(`${API_BASE_URL}/api/users-with-feedback`, {
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
    .then((data) => {
      if (data.success) {
        users = data.users;
        applyFiltersAndSort(); // initial render
      } else {
        console.error("Failed to load users:", data.message);
        alert("Failed to load users: " + (data.message || "Unknown error"));
      }
    })
    .catch((err) => {
      console.error("Error loading users:", err);
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
