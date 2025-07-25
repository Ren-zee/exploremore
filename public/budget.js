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

      if (statusElement) {
        statusElement.textContent = "Updating exchange rates...";
      }

      // Try multiple currency API sources in order
      let response;
      let data;

      // First try: exchangerate-api.com (free tier, reliable)
      try {
        response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );
        if (response.ok) {
          data = await response.json();
          console.log("ExchangeRate-API Response:", data);
        }
      } catch (error) {
        console.log("ExchangeRate-API failed:", error.message);
      }

      // Second try: Alternative API
      if (!data || !response || !response.ok) {
        try {
          response = await fetch(
            "https://api.freeforexapi.com/api/live?pairs=USDPHP,USDEUR,USDJPY,USDGBP,USDAUD,USDCAD,USDSGD,USDHKD,USDKRW,USDCNY,USDTHB,USDMYR,USDIDR,USDVND"
          );
          if (response.ok) {
            const freeForexData = await response.json();
            console.log("FreeForex-API Response:", freeForexData);

            // Convert to our expected format
            if (freeForexData.rates) {
              data = {
                rates: {},
              };
              Object.keys(freeForexData.rates).forEach((pair) => {
                const currency = pair.replace("USD", "");
                data.rates[currency] = freeForexData.rates[pair].rate;
              });
              data.rates.USD = 1; // Base currency
            }
          }
        } catch (error) {
          console.log("FreeForex-API failed:", error.message);
        }
      }

      if (!data || !data.rates) {
        throw new Error("All currency APIs failed or returned invalid data");
      }

      // Handle different possible response formats
      let rates = data.rates;

      // Convert all rates to PHP as base currency
      let phpRates;
      if (rates) {
        // If USD is base, convert to PHP base
        const usdToPhp = rates.PHP || 56.0; // Fallback rate if PHP not available

        phpRates = {
          PHP: 1,
          USD: 1 / usdToPhp,
          EUR: rates.EUR ? rates.EUR / usdToPhp : 0.016,
          JPY: rates.JPY ? rates.JPY / usdToPhp : 2.5,
          GBP: rates.GBP ? rates.GBP / usdToPhp : 0.014,
          AUD: rates.AUD ? rates.AUD / usdToPhp : 0.026,
          CAD: rates.CAD ? rates.CAD / usdToPhp : 0.024,
          SGD: rates.SGD ? rates.SGD / usdToPhp : 0.024,
          HKD: rates.HKD ? rates.HKD / usdToPhp : 0.14,
          KRW: rates.KRW ? rates.KRW / usdToPhp : 23.5,
          CNY: rates.CNY ? rates.CNY / usdToPhp : 0.13,
          THB: rates.THB ? rates.THB / usdToPhp : 0.64,
          MYR: rates.MYR ? rates.MYR / usdToPhp : 0.083,
          IDR: rates.IDR ? rates.IDR / usdToPhp : 270,
          VND: rates.VND ? rates.VND / usdToPhp : 430,
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

      if (statusElement) {
        statusElement.textContent = "Using fallback rates (API unavailable)";
      }

      // Fallback to static rates if API fails
      exchangeRates = {
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

      lastFetchTime = Date.now();
      return exchangeRates;
    }
  }

  // Function to calculate and display the total
  async function calculateTotal() {
    const loadingIndicator = document.getElementById("loadingIndicator");

    // Show loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = "block";
    }

    try {
      const duration =
        parseFloat(document.getElementById("stayDuration").value) || 0;
      const accommodation =
        parseFloat(document.getElementById("accommodationCost").value) || 0;
      const transportation =
        parseFloat(document.getElementById("transportationBudget").value) || 0;
      const food = parseFloat(document.getElementById("foodBudget").value) || 0;
      const other =
        parseFloat(document.getElementById("otherCosts").value) || 0;
      const currency = currencySelect ? currencySelect.value : "PHP";

      const totalInPeso =
        duration * accommodation + transportation + food + other;

      const conversionRates = await fetchExchangeRates();

      if (!conversionRates || !conversionRates[currency]) {
        throw new Error(`Currency ${currency} not available in exchange rates`);
      }

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
    } catch (error) {
      console.error("Error in calculateTotal:", error);

      // Hide loading indicator
      if (loadingIndicator) {
        loadingIndicator.style.display = "none";
      }

      // Show error message to user
      if (resultContainer && totalBudget) {
        totalBudget.textContent = "Error calculating budget. Please try again.";
        resultContainer.style.display = "block";
      }
    }
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
