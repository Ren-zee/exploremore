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