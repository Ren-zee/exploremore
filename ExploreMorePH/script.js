// Login Form Validation
function validateLoginForm(event) {
  event.preventDefault(); // Prevent form submission

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email) {
    alert("Please enter your email.");
    return false;
  }

  if (!validateEmail(email)) {
    alert("Please enter a valid email address.");
    return false;
  }

  if (!password) {
    alert("Please enter your password.");
    return false;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters long.");
    return false;
  }

  alert("Login successful!");
  return true;
}

// Sign-Up Form Validation
function validateSignUpForm(event) {
  event.preventDefault(); // Prevent form submission

  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirmPassword = document
    .getElementById("confirm-password")
    .value.trim();

  if (!email) {
    alert("Please enter your email.");
    return false;
  }

  if (!validateEmail(email)) {
    alert("Please enter a valid email address.");
    return false;
  }

  if (!password) {
    alert("Please enter your password.");
    return false;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters long.");
    return false;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return false;
  }

  alert("Sign-up successful!");
  return true;
}

// Helper function to validate email format
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Attach event listeners to forms
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form form");
  if (loginForm) {
    loginForm.addEventListener("submit", validateLoginForm);
  }

  const signUpForm = document.querySelector(".signup-form form");
  if (signUpForm) {
    signUpForm.addEventListener("submit", validateSignUpForm);
  }

  // Login Form Submission
  const loginFormEl = document.getElementById("loginForm");
  if (loginFormEl) {
    loginFormEl.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const { userId, role } = await response.json();
          localStorage.setItem("userId", userId);
          localStorage.setItem("role", role);
          alert("Login successful!");
          window.location.href = "aboutus.html";
        } else {
          const message = await response.text();
          alert(message);
        }
      } catch (error) {
        console.error("Error logging in:", error);
        alert("An error occurred. Please try again.");
      }
    });
  }

  // Signup Form Submission
  const signupFormEl = document.getElementById("signupForm");
  if (signupFormEl) {
    signupFormEl.addEventListener("submit", async (event) => {
      event.preventDefault();

      const fullname = document.getElementById("fullname").value.trim();
      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value.trim();
      const role = document.getElementById("role").value;

      console.log("Submitting signup form:", { fullname, email, password, role });

      try {
        const response = await fetch("http://localhost:3000/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullname, email, password, role }),
        });

        const message = await response.text();
        alert(message);

        if (response.ok) {
          window.location.href = "login.html";
        }
      } catch (error) {
        console.error("Error signing up:", error);
        alert("An error occurred. Please try again.");
      }
    });
  }

  // Feedback Form Submission
  const feedbackFormEl = document.getElementById("feedbackForm");
  if (feedbackFormEl) {
    feedbackFormEl.addEventListener("submit", async (event) => {
      event.preventDefault();

      const feedback = document.getElementById("feedback").value;
      const userId = localStorage.getItem("userId");

      if (!userId) {
        alert("You must be logged in to submit feedback.");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/submit-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, feedback }),
        });

        if (response.ok) {
          alert("Feedback submitted successfully!");
          document.getElementById("feedbackForm").reset();
        } else {
          const message = await response.text();
          alert(message);
        }
      } catch (error) {
        console.error("Error submitting feedback:", error);
        alert("An error occurred. Please try again.");
      }
    });
  }

  // Budget Calculator with Currency Conversion
  const budgetForm = document.getElementById("budgetForm");
  const currencySelect = document.getElementById("currency");
  const resultContainer = document.getElementById("resultContainer");
  const totalBudget = document.getElementById("totalBudget");

  // Function to calculate and display the total
  function calculateTotal() {
    const duration = parseFloat(document.getElementById("stayDuration").value) || 0;
    const accommodation = parseFloat(document.getElementById("accommodationCost").value) || 0;
    const transportation = parseFloat(document.getElementById("transportationBudget").value) || 0;
    const food = parseFloat(document.getElementById("foodBudget").value) || 0;
    const other = parseFloat(document.getElementById("otherCosts").value) || 0;
    const currency = currencySelect.value;

    const totalInPeso = duration * accommodation + transportation + food + other;

    // Conversion rates (example rates, replace with actual rates if needed)
    const conversionRates = {
      PHP: 1,
      USD: 0.018,
      EUR: 0.016,
      JPY: 2.5
    };

    const convertedTotal = totalInPeso * conversionRates[currency];
    const formattedTotal = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(convertedTotal);

    if (resultContainer && totalBudget) {
      totalBudget.textContent = formattedTotal;
    }
  }

  // Handle form submission
  if (budgetForm) {
    budgetForm.addEventListener("submit", function (e) {
      e.preventDefault();
      calculateTotal();
      if (resultContainer) {
        resultContainer.style.display = "block";
      }
    });

    // Handle currency change
    if (currencySelect) {
      currencySelect.addEventListener("change", calculateTotal);
    }

    // Handle reset button
    const resetButton = budgetForm.querySelector('button[type="reset"]');
    if (resetButton) {
      resetButton.addEventListener("click", function() {
        setTimeout(() => {
          if (resultContainer) {
            resultContainer.style.display = "none";
          }
        }, 0);
      });
    }

    // Handle input changes
    const inputs = budgetForm.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
      input.addEventListener("input", calculateTotal);
    });
  }
});

// Logout Function
function logout() {
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  alert("You have been logged out.");
  window.location.href = "login.html";
}

// Show/Hide Login, Signup, and Logout Buttons Based on Login Status
document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  const loginButton = document.getElementById("loginButton");
  const signupButton = document.getElementById("signupButton");
  const logoutButton = document.getElementById("logoutButton");

  if (userId) {
    loginButton.classList.add("d-none");
    signupButton.classList.add("d-none");
    logoutButton.classList.remove("d-none");
  } else {
    loginButton.classList.remove("d-none");
    signupButton.classList.remove("d-none");
    logoutButton.classList.add("d-none");
  }
});
