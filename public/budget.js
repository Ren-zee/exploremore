// Budget Calculator functionality
document.addEventListener("DOMContentLoaded", function () {
  initializeBudgetCalculator();
});

function initializeBudgetCalculator() {
  const budgetForm = document.getElementById("budgetForm");
  const currencySelect = document.getElementById("currency");
  const resultContainer = document.getElementById("resultContainer");
  const totalBudget = document.getElementById("totalBudget");

 
  let exchangeRates = null;
  let lastFetchTime = null;
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

  // Function to fetch exchange rates from API
  async function fetchExchangeRates() {
    const statusElement = document.getElementById("currencyStatus");

    try {
      // Check if we have cached rates that are still fresh
      const now = Date.now();
      if (
        exchangeRates &&
        lastFetchTime &&
        now - lastFetchTime < CACHE_DURATION
      ) {
        if (statusElement) {
          const ageMinutes = Math.floor((now - lastFetchTime) / (60 * 1000));
          statusElement.textContent = `Rates cached (${ageMinutes}m ago)`;
        }
        return exchangeRates;
      }

      // if (statusElement) {
      //   statusElement.textContent = "Updating exchange rates...";
      // }

      // Using the new API plugin with PHP as base currency
      let response;
      try {
        response = await fetch("https://v1.apiplugin.io/v1/currency/CrTjEDuj");
      } catch (fetchError) {
        // If the primary API fails, try alternative format
        response = await fetch(
          "https://v1.apiplugin.io/v1/currency/CrTjEDuj?base=PHP"
        );
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Handle different possible response formats
      let rates = null;

      if (data.rates) {
        rates = data.rates;
      } else if (data.data && data.data.rates) {
        rates = data.data.rates;
      } else if (data.conversion_rates) {
        rates = data.conversion_rates;
      } else if (
        data.result &&
        data.result === "success" &&
        data.conversion_rates
      ) {
        rates = data.conversion_rates;
      }

      // If we have rates data, process it
      let phpRates;
      if (rates) {
        // Convert all rates to PHP as base currency
        const phpToBase = rates.PHP ? 1 / rates.PHP : 1;

        phpRates = {
          PHP: 1,
          USD: rates.USD ? rates.USD * phpToBase : 0.018,
          EUR: rates.EUR ? rates.EUR * phpToBase : 0.016,
          JPY: rates.JPY ? rates.JPY * phpToBase : 2.5,
          GBP: rates.GBP ? rates.GBP * phpToBase : 0.014,
          AUD: rates.AUD ? rates.AUD * phpToBase : 0.026,
          CAD: rates.CAD ? rates.CAD * phpToBase : 0.024,
          SGD: rates.SGD ? rates.SGD * phpToBase : 0.024,
          HKD: rates.HKD ? rates.HKD * phpToBase : 0.14,
          KRW: rates.KRW ? rates.KRW * phpToBase : 23.5,
          CNY: rates.CNY ? rates.CNY * phpToBase : 0.13,
          THB: rates.THB ? rates.THB * phpToBase : 0.64,
          MYR: rates.MYR ? rates.MYR * phpToBase : 0.083,
          IDR: rates.IDR ? rates.IDR * phpToBase : 270,
          VND: rates.VND ? rates.VND * phpToBase : 430,
        };
      } else {

        throw new Error("No rates data found in API response");
      }

      exchangeRates = phpRates;
      lastFetchTime = now;

      if (statusElement) {
        statusElement.textContent = "Live rates updated";
        setTimeout(() => {
          if (statusElement) {
            statusElement.textContent = "Rates cached (0m ago)";
          }
        }, 2000);
      }

      console.log("Exchange rates updated:", exchangeRates);
      return exchangeRates;
    } catch (error) {
      console.error("Error fetching exchange rates:", error);

      // if (statusElement) {
      //   statusElement.textContent = "Using fallback rates (API unavailable)";
      // }

      // Fallback to static rates if API fails
      return {
        PHP: 1,
        USD: 0.018,
        EUR: 0.016,
        JPY: 2.5,
        GBP: 0.014,
        AUD: 0.026,
        CAD: 0.024,
        SGD: 0.024,
        HKD: 0.14,
        KRW: 23.5,
        CNY: 0.13,
        THB: 0.64,
        MYR: 0.083,
        IDR: 270,
        VND: 430,
      };
    }
  }

  // Function to calculate and display the total
  async function calculateTotal() {
    const loadingIndicator = document.getElementById("loadingIndicator");

    // Show loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = "block";
    }

    const duration =
      parseFloat(document.getElementById("stayDuration").value) || 0;
    const accommodation =
      parseFloat(document.getElementById("accommodationCost").value) || 0;
    const transportation =
      parseFloat(document.getElementById("transportationBudget").value) || 0;
    const food = parseFloat(document.getElementById("foodBudget").value) || 0;
    const other = parseFloat(document.getElementById("otherCosts").value) || 0;
    const currency = currencySelect ? currencySelect.value : "PHP";

    const totalInPeso =
      duration * accommodation + transportation + food + other;

    const conversionRates = await fetchExchangeRates();

    const convertedTotal = totalInPeso * conversionRates[currency];
    const formattedTotal = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(convertedTotal);

    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }

    if (resultContainer && totalBudget) {
      totalBudget.textContent = formattedTotal;
      resultContainer.style.display = "block";
    }

    console.log("Calculation:", {
      duration,
      accommodation,
      transportation,
      food,
      other,
      totalInPeso,
      convertedTotal,
      formattedTotal,
      exchangeRates: conversionRates,
    });
  }
  // Handle form submission
  if (budgetForm) {
    budgetForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      await calculateTotal();
      if (resultContainer) {
        resultContainer.style.display = "block";
      }
    });

    // Handle currency change
    if (currencySelect) {
      currencySelect.addEventListener("change", async function () {
        // Only calculate if we have some values entered
        const hasValues =
          document.getElementById("stayDuration").value ||
          document.getElementById("accommodationCost").value ||
          document.getElementById("transportationBudget").value ||
          document.getElementById("foodBudget").value ||
          document.getElementById("otherCosts").value;

        if (hasValues) {
          await calculateTotal();
        }
      });
    }

    // Handle reset button
    const resetButton = budgetForm.querySelector('button[type="reset"]');
    if (resetButton) {
      resetButton.addEventListener("click", function () {
        setTimeout(() => {
          if (resultContainer) {
            resultContainer.style.display = "none";
          }
        }, 0);
      });
    }

    // Handle input changes
    const inputs = budgetForm.querySelectorAll('input[type="number"]');
    inputs.forEach((input) => {
      input.addEventListener("input", async function () {
        // Only calculate if all required fields have values
        const allInputs = budgetForm.querySelectorAll('input[type="number"]');
        const allFilled = Array.from(allInputs).every(
          (input) => input.value.trim() !== ""
        );

        if (allFilled) {
          await calculateTotal();
        }
      });
    });
  }

  // Pre-fetch exchange rates when the calculator initializes
  fetchExchangeRates();
}
