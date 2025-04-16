// Login Form Validation
function validateLoginForm(event) {
  event.preventDefault(); // Prevent form submission

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email) {
    alert('Please enter your email.');
    return false;
  }

  if (!validateEmail(email)) {
    alert('Please enter a valid email address.');
    return false;
  }

  if (!password) {
    alert('Please enter your password.');
    return false;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters long.');
    return false;
  }

  alert('Login successful!');
  return true;
}

// Sign-Up Form Validation
function validateSignUpForm(event) {
  event.preventDefault(); // Prevent form submission

  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value.trim();
  const confirmPassword = document.getElementById('confirm-password').value.trim();

  if (!email) {
    alert('Please enter your email.');
    return false;
  }

  if (!validateEmail(email)) {
    alert('Please enter a valid email address.');
    return false;
  }

  if (!password) {
    alert('Please enter your password.');
    return false;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters long.');
    return false;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return false;
  }

  alert('Sign-up successful!');
  return true;
}

// Helper function to validate email format
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Attach event listeners to forms
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('.login-form form');
  if (loginForm) {
    loginForm.addEventListener('submit', validateLoginForm);
  }

  const signUpForm = document.querySelector('.signup-form form');
  if (signUpForm) {
    signUpForm.addEventListener('submit', validateSignUpForm);
  }
});

// Budget Calculator with Currency Conversion
document.getElementById("budgetForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const duration = parseFloat(document.getElementById("stayDuration").value);
  const accommodation = parseFloat(document.getElementById("accommodationCost").value);
  const transportation = parseFloat(document.getElementById("transportationBudget").value);
  const food = parseFloat(document.getElementById("foodBudget").value);
  const other = parseFloat(document.getElementById("otherCosts").value);
  const currency = document.getElementById("currency").value;

  if (isNaN(duration) || isNaN(accommodation) || isNaN(transportation) || isNaN(food) || isNaN(other)) {
    alert("Please fill in all fields with valid numbers.");
    return;
  }

  const totalInPeso = (duration * accommodation) + transportation + food + other;

  // Conversion rates (example rates, replace with actual rates if needed)
  // Fetch real-time conversion rates from an API
  let conversionRates = {};
  fetch('https://api.exchangerate-api.com/v4/latest/PHP')
    .then(response => response.json())
    .then(data => {
      conversionRates = {
        USD: data.rates.USD,
        EUR: data.rates.EUR,
        JPY: data.rates.JPY,
      };
    })
    .catch(error => {
      console.error('Error fetching conversion rates:', error);
      alert('Unable to fetch real-time conversion rates. Please try again later.');
    });

  // Wait for conversion rates to be fetched before calculating
  fetch('https://api.exchangerate-api.com/v4/latest/PHP')
    .then(response => response.json())
    .then(data => {
      conversionRates = {
        USD: data.rates.USD,
        EUR: data.rates.EUR,
        JPY: data.rates.JPY,
      };

      const convertedTotal = totalInPeso * (conversionRates[currency] || 1);

      // Update the result and make it visible
      document.getElementById("totalBudget").textContent = `${convertedTotal.toFixed(2)} ${currency}`;
      document.getElementById("resultContainer").style.display = "block";
    })
    .catch(error => {
      console.error('Error fetching conversion rates:', error);
      alert('Unable to fetch real-time conversion rates. Please try again later.');
    });
});
