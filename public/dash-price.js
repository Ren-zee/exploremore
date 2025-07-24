// Configuration for API base URL
const API_BASE_URL = "https://exploremore-production-c375.up.railway.app"; // For production
// const API_BASE_URL = 'http://localhost:3001'; // For local testing

const spotMap = {
  "Luzon": {
    "Nagsasa Cove": 1,
    "Pacific View Deck": 2,
    "Masungi Georeserve": 3
  },
  "Visayas": {
    "Guisi Lighthouse": 4,
    "Linao Cave": 5,
    "Nova Shell Museum": 6
  },
  "Mindanao": {
    "Philippine Eagle Center": 7,
    "Tinago Falls": 8,
    "Mount Hamiguitan Range Wildlife Sanctuary": 9
  }
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".accordion-body button").forEach(button => {
    button.addEventListener("click", () => {
      const region = button.closest(".accordion-item").querySelector(".accordion-button").innerText.trim();
      const spotName = button.innerText.trim();
      const spotId = spotMap[region]?.[spotName];
      if (spotId) {
        const container = button.closest(".accordion-body").querySelector("div[id^='priceBreakdownTableContainer']");
        loadPriceTable(spotId, container);
      }
    });
  });
});

function loadPriceTable(spotId, container) {
  fetch(`${API_BASE_URL}/api/price-breakdown/${spotId}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        renderEditableTable(data.breakdown, spotId, container);
      } else {
        alert("Failed to fetch data.");
      }
    });
}

function renderEditableTable(breakdown, spotId, container) {
  container.innerHTML = `
    <table class="table table-bordered table-striped">
      <thead class="table-dark">
        <tr>
          <th>Category</th>
          <th>Label</th>
          <th>Min Price</th>
          <th>Max Price</th>
          <th>Notes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${breakdown.map(row => `
          <tr data-id="${row.id || ''}">
            <td>${row.category}</td>
            <td>
                ${["transportation", "fees"].includes(row.category.toLowerCase()) 
                ? `<input type="text" class="form-control label-input" value="${row.label}">` 
                : row.label}
            </td>
            <td><input type="number" class="form-control" value="${row.price_min}"></td>
            <td><input type="number" class="form-control" value="${row.price_max}"></td>
            <td><input type="text" class="form-control" value="${row.notes || ''}"></td>
            <td><button class="btn btn-success btn-sm save-btn">Save</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.querySelectorAll(".save-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const row = btn.closest("tr");
      const category = row.children[0].innerText;
      const labelCell = row.children[1];
      const labelInput = labelCell.querySelector("input");
      const label = labelInput ? labelInput.value : labelCell.innerText;
      const price_min = row.children[2].querySelector("input").value;
      const price_max = row.children[3].querySelector("input").value;
      const notes = row.children[4].querySelector("input").value;

      fetch(`${API_BASE_URL}/api/update-price-breakdown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotId,
          category,
          label,
          price_min,
          price_max,
          notes
        })
      })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          alert("Updated successfully!");
        } else {
          alert("Update failed: " + response.message);
        }
      });
    });
  });
}
