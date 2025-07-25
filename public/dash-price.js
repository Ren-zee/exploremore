// Configuration for API base URL (using global config)
// Note: API_BASE_URL is now available globally through window.ExploreMoreConfig.API_BASE_URL

// Helper function to get API base URL
function getApiBaseUrl() {
  return (
    window.ExploreMoreConfig?.API_BASE_URL ||
    "https://exploremore-production-c375.up.railway.app"
  );
}

const spotMap = {
  Luzon: {
    "Nagsasa Cove": 1,
    "Pacific View Deck": 2,
    "Masungi Georeserve": 3,
  },
  Visayas: {
    "Guisi Lighthouse": 4,
    "Linao Cave": 5,
    "Nova Shell Museum": 6,
  },
  Mindanao: {
    "Philippine Eagle Center": 7,
    "Tinago Falls": 8,
    "Mount Hamiguitan Range Wildlife Sanctuary": 9,
  },
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("Price breakdown dashboard loaded");
  console.log("API Base URL:", getApiBaseUrl());

  document.querySelectorAll(".accordion-body button").forEach((button) => {
    button.addEventListener("click", () => {
      const region = button
        .closest(".accordion-item")
        .querySelector(".accordion-button")
        .innerText.trim();
      const spotName = button.innerText.trim();
      const spotId = spotMap[region]?.[spotName];

      console.log("Button clicked:", { region, spotName, spotId });

      if (spotId) {
        const container = button
          .closest(".accordion-body")
          .querySelector("div[id^='priceBreakdownTableContainer']");
        console.log("Container found:", container);
        loadPriceTable(spotId, container);
      } else {
        console.error("Spot ID not found for:", { region, spotName });
        showError(
          "Configuration Error",
          `Spot ID not found for ${spotName} in ${region}`
        );
      }
    });
  });
});

function loadPriceTable(spotId, container) {
  console.log("Loading price table for spot ID:", spotId);
  const apiUrl = `${getApiBaseUrl()}/api/price-breakdown/${spotId}`;
  console.log("Fetching from URL:", apiUrl);

  fetch(apiUrl, {
    credentials: "include", // Include credentials for authentication
  })
    .then((res) => {
      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);
      return res.json();
    })
    .then((data) => {
      console.log("Response data:", data);
      if (data.success) {
        renderEditableTable(data.breakdown, spotId, container);
      } else {
        console.error("API returned error:", data.message);
        showError(
          "Data Load Failed",
          `Failed to fetch data: ${data.message || "Unknown error"}`
        );
      }
    })
    .catch((error) => {
      console.error("Error fetching price breakdown:", error);
      showError(
        "Connection Error",
        `Error fetching price data: ${error.message}`
      );
    });
}

function renderEditableTable(breakdown, spotId, container) {
  console.log("Rendering table with breakdown:", breakdown);
  console.log("Container element:", container);

  if (!breakdown || breakdown.length === 0) {
    container.innerHTML =
      '<p class="alert alert-warning">No price data available for this spot.</p>';
    return;
  }

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
        ${breakdown
          .map(
            (row) => `
          <tr data-id="${row.id || ""}">
            <td>${row.category}</td>
            <td>
                ${
                  ["transportation", "fees"].includes(
                    row.category.toLowerCase()
                  )
                    ? `<input type="text" class="form-control label-input" value="${row.label}">`
                    : row.label
                }
            </td>
            <td><input type="number" class="form-control" value="${
              row.price_min
            }"></td>
            <td><input type="number" class="form-control" value="${
              row.price_max
            }"></td>
            <td><input type="text" class="form-control" value="${
              row.notes || ""
            }"></td>
            <td><button class="btn btn-success btn-sm save-btn">Save</button></td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;

  container.querySelectorAll(".save-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest("tr");
      const category = row.children[0].innerText;
      const labelCell = row.children[1];
      const labelInput = labelCell.querySelector("input");
      const label = labelInput ? labelInput.value : labelCell.innerText;
      const price_min = row.children[2].querySelector("input").value;
      const price_max = row.children[3].querySelector("input").value;
      const notes = row.children[4].querySelector("input").value;

      fetch(`${getApiBaseUrl()}/api/update-price-breakdown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotId,
          category,
          label,
          price_min,
          price_max,
          notes,
        }),
        credentials: "include", // Include credentials for authentication
      })
        .then((res) => res.json())
        .then((response) => {
          if (response.success) {
            showSuccess("Update Complete", "Price data updated successfully!");
          } else {
            showError("Update Failed", `Update failed: ${response.message}`);
          }
        })
        .catch((error) => {
          console.error("Error updating price breakdown:", error);
          showError(
            "Update Error",
            `Error updating price data: ${error.message}`
          );
        });
    });
  });
}
