function sendOTP() {
  const phone = document.getElementById("phoneNumber").value;
  if (!phone) {
    alert("❌ Please enter your phone number first!");
    return;
  }
  alert("📲 OTP has been sent to " + phone);
  
  // Enable OTP input field after sending
  const otpInput = document.getElementById("otpCode");
  otpInput.disabled = false;
  otpInput.placeholder = "Enter OTP";
  otpInput.focus();
  
  // Change button text to indicate OTP was sent
  const sendBtn = document.querySelector('.otp-btn');
  sendBtn.textContent = "Resend";
  sendBtn.onclick = resendOTP;
  
  // Check form completion after enabling OTP
  checkRegisterFormCompletion();
}

function resendOTP() {
  const phone = document.getElementById("phoneNumber").value;
  if (!phone) {
    alert("❌ Please enter your phone number first!");
    return;
  }
  alert("📲 OTP has been resent to " + phone);
  
  // Clear OTP input and focus on it
  const otpInput = document.getElementById("otpCode");
  otpInput.value = "";
  otpInput.focus();
}

// OTP input validation - only allow numbers
function validateOTPInput(input) {
  // Remove any non-numeric characters
  input.value = input.value.replace(/[^0-9]/g, '');
  
  // Auto-focus next input if 6 digits entered
  if (input.value.length === 6) {
    input.blur();
  }
}

// Switch forms
function showForm(formId) {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("forgotForm").classList.add("hidden");
  document.getElementById(formId).classList.remove("hidden");
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector('i');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) { icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }
  } else {
    input.type = 'password';
    if (icon) { icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }
  }
}

// ✅ Auto-fill + Auto-login only if saved before
window.onload = function () {
  const savedEmail = localStorage.getItem("email");
  const savedPassword = localStorage.getItem("password");

  if (savedEmail && savedPassword) {
    // Fill values + keep checkbox ticked
    document.getElementById("loginEmail").value = savedEmail;
    document.getElementById("loginPassword").value = savedPassword;
    document.getElementById("rememberMe").checked = true;

    // ⚡ Auto-login directly
    autoLogin(savedEmail, savedPassword);
  } else {
    // If nothing saved → clear form + checkbox
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
    document.getElementById("rememberMe").checked = false;
  }

  // Add OTP input validation
  const otpInput = document.getElementById("otpCode");
  if (otpInput) {
    otpInput.addEventListener("input", function() {
      validateOTPInput(this);
      checkRegisterFormCompletion();
    });
    
    // Allow all keys but filter on input
    otpInput.addEventListener("keydown", function(e) {
      // Allow navigation and control keys
      if (['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        return;
      }
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
        return;
      }
      // Only allow numbers
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    });
  }

  // Add form validation listeners
  setupRegisterFormValidation();
  
  // Add password requirements validation
  const passwordInput = document.getElementById("registerPassword");
  if (passwordInput) {
    passwordInput.addEventListener("input", validatePasswordRequirements);
    passwordInput.addEventListener("input", validatePasswordMatch);
    passwordInput.addEventListener("focus", function() {
      document.getElementById("passwordRequirements").style.display = "block";
    });
  }
  
  // Add confirm password validation
  const confirmPasswordInput = document.getElementById("registerConfirmPassword");
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", validatePasswordMatch);
  }
};

// Validate password requirements in real-time
function validatePasswordRequirements() {
  const password = document.getElementById("registerPassword")?.value || "";
  
  // Check each requirement
  const checks = {
    "req-length": password.length >= 8,
    "req-uppercase": /[A-Z]/.test(password),
    "req-lowercase": /[a-z]/.test(password),
    "req-number": /[0-9]/.test(password),
    "req-special": /[!@#$%^&*]/.test(password)
  };
  
  // Update each requirement item
  Object.keys(checks).forEach(reqId => {
    const reqItem = document.getElementById(reqId);
    if (reqItem) {
      if (checks[reqId]) {
        reqItem.classList.add("valid");
      } else {
        reqItem.classList.remove("valid");
      }
    }
  });
}

// Validate password match in real-time
function validatePasswordMatch() {
  const password = document.getElementById("registerPassword")?.value || "";
  const confirmPassword = document.getElementById("registerConfirmPassword")?.value || "";
  const errorMessage = document.getElementById("passwordMatchError");
  const confirmPasswordInput = document.getElementById("registerConfirmPassword");
  
  if (!errorMessage || !confirmPasswordInput) return;
  
  // Only show error if confirm password has been typed and passwords don't match
  if (confirmPassword.length > 0 && password !== confirmPassword) {
    errorMessage.style.display = "flex";
    confirmPasswordInput.style.borderColor = "#f66";
    confirmPasswordInput.style.backgroundColor = "#fff5f5";
  } else {
    errorMessage.style.display = "none";
    if (confirmPassword.length > 0 && password === confirmPassword) {
      // Passwords match - show success state
      confirmPasswordInput.style.borderColor = "#28a745";
      confirmPasswordInput.style.backgroundColor = "#f0fff4";
    } else {
      // Reset to normal state
      confirmPasswordInput.style.borderColor = "#e0e0e0";
      confirmPasswordInput.style.backgroundColor = "#fafafa";
    }
  }
  
  // Update register button state
  checkRegisterFormCompletion();
}

// Setup register form validation
function setupRegisterFormValidation() {
  const registerInputs = [
    'registerUsername',
    'registerEmail', 
    'phoneNumber',
    'otpCode',
    'registerPassword',
    'registerConfirmPassword'
  ];
  
  registerInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', checkRegisterFormCompletion);
      input.addEventListener('change', checkRegisterFormCompletion);
    }
  });
}

// Check if register form is complete and enable/disable button
function checkRegisterFormCompletion() {
  const username = document.getElementById("registerUsername")?.value.trim() || "";
  const email = document.getElementById("registerEmail")?.value.trim() || "";
  const phone = document.getElementById("phoneNumber")?.value.trim() || "";
  const otp = document.getElementById("otpCode")?.value.trim() || "";
  const password = document.getElementById("registerPassword")?.value || "";
  const confirmPassword = document.getElementById("registerConfirmPassword")?.value || "";
  
  const registerBtn = document.querySelector('#registerForm button[type="submit"]');
  
  if (!registerBtn) return;
  
  // Check if all fields are filled and OTP is enabled
  const allFieldsFilled = username && email && phone && otp && password && confirmPassword;
  const otpEnabled = !document.getElementById("otpCode")?.disabled;
  const otpValid = otp.length === 6;
  const passwordsMatch = password === confirmPassword && password.length > 0;
  
  // Enable button only if all fields filled, OTP valid, and passwords match
  if (allFieldsFilled && otpEnabled && otpValid && passwordsMatch) {
    registerBtn.disabled = false;
    registerBtn.style.opacity = "1";
  } else {
    registerBtn.disabled = true;
    registerBtn.style.opacity = "0.6";
  }
}

// ✅ Handle normal login
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const remember = document.getElementById("rememberMe").checked;

  if (remember) {
    // Save login details ONLY if checkbox is ticked
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);
  } else {
    // Clear saved login if checkbox not ticked
    localStorage.removeItem("email");
    localStorage.removeItem("password");
  }

  loginSuccess(email);
});

// ✅ Auto-login function
function autoLogin(email, password) {
  console.log("Auto-logged in with:", email, password);
  loginSuccess(email);
}

// ✅ Common success action
function loginSuccess(email) {
  alert("✅ Logged in successfully as " + email + "!");
  // Redirect to home page
  window.location.href = "home.html";
}

// ✅ Register form validation and submission
document.getElementById("registerForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  // Get all form values
  const username = document.getElementById("registerUsername").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const phone = document.getElementById("phoneNumber").value.trim();
  const otp = document.getElementById("otpCode").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("registerConfirmPassword").value;
  
  // Validate all fields are filled
  if (!username || !email || !phone || !otp || !password || !confirmPassword) {
    alert("❌ Please fill in all required fields!");
    return;
  }
  
  // Validate OTP is enabled (was sent)
  if (document.getElementById("otpCode").disabled) {
    alert("❌ Please send OTP first!");
    return;
  }
  
  // Validate OTP length
  if (otp.length !== 6) {
    alert("❌ Please enter a valid 6-digit OTP!");
    return;
  }
  
  // Validate password match
  if (password !== confirmPassword) {
    alert("❌ Passwords do not match!");
    return;
  }
  
  // Validate password strength
  if (password.length < 6) {
    alert("❌ Password must be at least 6 characters long!");
    return;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("❌ Please enter a valid email address!");
    return;
  }
  
  // Validate phone number
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(phone)) {
    alert("❌ Please enter a valid phone number!");
    return;
  }
  
  // If all validations pass
  alert("✅ Account registered successfully!");
  
  // Clear all form fields
  document.getElementById("registerUsername").value = "";
  document.getElementById("registerEmail").value = "";
  document.getElementById("phoneNumber").value = "";
  document.getElementById("otpCode").value = "";
  document.getElementById("registerPassword").value = "";
  document.getElementById("registerConfirmPassword").value = "";
  
  // Disable OTP input again
  document.getElementById("otpCode").disabled = true;
  
  // Reset OTP button
  const sendBtn = document.querySelector('.otp-btn');
  sendBtn.textContent = "Send";
  sendBtn.onclick = sendOTP;
  
  // Redirect to login form
  showForm('loginForm');
});

// ✅ Forgot form (demo)
document.getElementById("forgotForm").addEventListener("submit", function(e) {
  e.preventDefault();
  alert("📧 Password reset link sent to your email!");
});

function handleGoogleResponse(response) {
  console.log("Google JWT Token: ", response.credential);
  alert("✅ Logged in with Google!");
  // Redirect to home page
  window.location.href = "home.html";
}

// Facebook SDK init 
window.fbAsyncInit = function() 
{ FB.init({ appId : 'YOUR_FACEBOOK_APP_ID',
 cookie : true,
  xfbml : true,
   version : 'v19.0'
 }); 
}; 

function facebookLogin() 
{ FB.login(function(response) { 
    if (response.authResponse) { 
        console.log('Facebook login success:', response);
         alert("✅ Logged in with Facebook!");
         // Redirect to home page
         window.location.href = "home.html";
         } else { 
            alert("❌ Facebook login cancelled!");
          } 
        }, {scope: 'public_profile,email'}); }
