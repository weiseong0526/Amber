function editPhoto() {
  // Create file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        // Update the profile picture in the form section
        const profilePicture = document.querySelector('.profile-picture');
        profilePicture.style.backgroundImage = `url(${e.target.result})`;
        profilePicture.style.backgroundSize = 'cover';
        profilePicture.style.backgroundPosition = 'center';
        profilePicture.style.color = 'transparent'; // Hide text but keep it for accessibility

        // Update the profile avatar in the left panel
        const profileAvatar = document.querySelector('.profile-avatar');
        profileAvatar.style.backgroundImage = `url(${e.target.result})`;
        profileAvatar.style.backgroundSize = 'cover';
        profileAvatar.style.backgroundPosition = 'center';
        profileAvatar.style.color = 'transparent'; // Hide text but keep it for accessibility

        // Save photo to localStorage for persistence
        localStorage.setItem('userProfilePhoto', e.target.result);

        // Show success message
        showNotification('✅ Profile photo updated successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

function updateProfile(event) {
  event.preventDefault();
  
  // Get form data
  const formData = {
    fullName: document.getElementById('fullName').value,
    phoneNumber: document.getElementById('phoneNumber').value,
    gender: document.getElementById('gender').value,
    email: document.getElementById('email').value,
    dateOfBirth: document.getElementById('dateOfBirth').value
  };

  // Validate form data
  if (!formData.fullName.trim()) {
    showNotification('❌ Please enter your full name', 'error');
    return;
  }

  if (!formData.email.trim()) {
    showNotification('❌ Please enter your email address', 'error');
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    showNotification('❌ Please enter a valid email address', 'error');
    return;
  }

  // Validate date of birth
  if (formData.dateOfBirth && !validateDateOfBirth(formData.dateOfBirth)) {
    showNotification('❌ Please enter a valid date of birth', 'error');
    return;
  }

  // Save to localStorage for persistence across pages
  localStorage.setItem('userProfile', JSON.stringify(formData));

  // Update the left panel profile summary
  updateProfileSummary(formData);

  // Show success message
  showNotification('✅ Profile updated successfully!', 'success');
  
  // Here you would typically send the data to your backend
  console.log('Profile data:', formData);
}

function updateProfileSummary(formData) {
  // Update profile name
  const profileName = document.querySelector('.profile-name');
  if (profileName && formData.fullName) {
    profileName.textContent = formData.fullName;
  }

  // Update profile email
  const profileEmail = document.querySelector('.profile-email');
  if (profileEmail && formData.email) {
    profileEmail.textContent = formData.email;
  }

  // Update profile avatar initials
  const profileAvatar = document.querySelector('.profile-avatar');
  if (profileAvatar && formData.fullName) {
    const initials = getInitials(formData.fullName);
    profileAvatar.textContent = initials;
    // Only show initials if no background image is set
    if (!profileAvatar.style.backgroundImage || profileAvatar.style.backgroundImage === 'none') {
      profileAvatar.style.color = 'white';
    }
  }

  // Update the profile picture in the form section
  const profilePicture = document.querySelector('.profile-picture');
  if (profilePicture && formData.fullName) {
    const initials = getInitials(formData.fullName);
    profilePicture.textContent = initials;
    // Only show initials if no background image is set
    if (!profilePicture.style.backgroundImage || profilePicture.style.backgroundImage === 'none') {
      profilePicture.style.color = 'white';
    }
  }
}

function getInitials(fullName) {
  return fullName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}

function validateDateOfBirth(dateString) {
  if (!dateString) return false;
  
  const birthDate = new Date(dateString);
  const today = new Date();
  
  // Check if date is valid
  if (isNaN(birthDate.getTime())) return false;
  
  // Check if date is not in the future
  if (birthDate > today) return false;
  
  return true;
}

function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
    color: white;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 1000;
    font-weight: 600;
    animation: slideInRight 0.3s ease-out;
  `;
  notification.textContent = message;
  
  // Add animation keyframes
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

function openDatePicker() {
  // Trigger the date input's native date picker
  const dateInput = document.getElementById('dateOfBirth');
  dateInput.focus();
  dateInput.showPicker();
}

// Back to top functionality
function scrollToTop() {
  const profileFormContent = document.querySelector('.profile-form-content');
  if (profileFormContent) {
    profileFormContent.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

// Show/hide back to top button based on scroll position
function toggleBackToTop() {
  const backToTop = document.getElementById('backToTop');
  const profileFormContent = document.querySelector('.profile-form-content');
  
  if (backToTop && profileFormContent) {
    if (profileFormContent.scrollTop > 300) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  }
}

// Navigation Functions
function navigateToMyProfile() {
  console.log('navigateToMyProfile called');
  setTimeout(() => {
    try {
      window.location.href = 'my-profile.html';
    } catch (error) {
      console.error('Error navigating to My Profile:', error);
    }
  }, 500);
}

function navigateToSettings() {
  console.log('navigateToSettings called');
  setTimeout(() => {
    try {
      window.location.href = 'Settings.html';
    } catch (error) {
      console.error('Error navigating to Settings:', error);
    }
  }, 500);
}

function navigateToPrivacyPolicy() {
  console.log('navigateToPrivacyPolicy called');
  setTimeout(() => {
    try {
      window.location.href = 'privacy-policy.html';
    } catch (error) {
      console.error('Error navigating to Privacy Policy:', error);
    }
  }, 500);
}

function navigateToTerms() {
  console.log('navigateToTerms called');
  setTimeout(() => {
    try {
      window.location.href = 'terms-conditions.html';
    } catch (error) {
      console.error('Error navigating to Terms and Conditions:', error);
    }
  }, 500);
}

function showNotificationPageNotification(event) {
  showNotification("🔔 Redirecting to notifications...", "info");
  // Let the default link behavior happen
}

function showProfilePageNotification(event) {
  showNotification("🔔 Redirecting to notifications...", "info");
  // Let the default link behavior happen
}

function logout() {
  console.log('logout function called');
  try {
    if (confirm("🚪 Are you sure you want to log out?")) {
      console.log('User confirmed logout');
      showNotification("👋 Logging out... Goodbye!", "success");
      setTimeout(() => {
        console.log('Starting logout process...');
        showNotification("✅ Successfully logged out!", "success");
        // Clear any saved login data
        localStorage.removeItem("email");
        localStorage.removeItem("password");
        localStorage.removeItem("userProfile");
        localStorage.removeItem("userProfilePhoto");
        console.log('LocalStorage cleared, redirecting to login page...');
        // Redirect to login page with multiple fallback methods
        try {
          window.location.href = 'login.html';
        } catch (error) {
          console.error('Error with window.location.href:', error);
          try {
            window.location.assign('login.html');
          } catch (error2) {
            console.error('Error with window.location.assign:', error2);
            window.location.replace('login.html');
          }
        }
      }, 1000);
    } else {
      console.log('User cancelled logout');
    }
  } catch (error) {
    console.error('Error in logout function:', error);
    showNotification("❌ Error during logout. Please try again.", "error");
  }
}

// Load profile data from localStorage
function loadProfileData() {
  const savedProfile = localStorage.getItem('userProfile');
  if (savedProfile) {
    try {
      const profileData = JSON.parse(savedProfile);
      
      // Update form fields
      if (profileData.fullName) {
        document.getElementById('fullName').value = profileData.fullName;
      }
      if (profileData.phoneNumber) {
        document.getElementById('phoneNumber').value = profileData.phoneNumber;
      }
      if (profileData.gender) {
        document.getElementById('gender').value = profileData.gender;
      }
      if (profileData.email) {
        document.getElementById('email').value = profileData.email;
      }
      if (profileData.dateOfBirth) {
        document.getElementById('dateOfBirth').value = profileData.dateOfBirth;
      }

      // Update profile summary
      updateProfileSummary(profileData);
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  }

  // Load saved profile photo
  const savedPhoto = localStorage.getItem('userProfilePhoto');
  if (savedPhoto) {
    const profilePicture = document.querySelector('.profile-picture');
    const profileAvatar = document.querySelector('.profile-avatar');
    
    if (profilePicture) {
      profilePicture.style.backgroundImage = `url(${savedPhoto})`;
      profilePicture.style.backgroundSize = 'cover';
      profilePicture.style.backgroundPosition = 'center';
      profilePicture.style.color = 'transparent';
    }
    
    if (profileAvatar) {
      profileAvatar.style.backgroundImage = `url(${savedPhoto})`;
      profileAvatar.style.backgroundSize = 'cover';
      profileAvatar.style.backgroundPosition = 'center';
      profileAvatar.style.color = 'transparent';
    }
  }
}

// Initialize date input functionality
document.addEventListener('DOMContentLoaded', function() {
  // Load saved profile data
  loadProfileData();

  // Setup back to top button functionality
  const profileFormContent = document.querySelector('.profile-form-content');
  if (profileFormContent) {
    profileFormContent.addEventListener('scroll', toggleBackToTop);
  }

  // Set up date input with proper formatting
  const dateInput = document.getElementById('dateOfBirth');
  
  // Add event listener for date change
  dateInput.addEventListener('change', function() {
    // Format the date for display if needed
    if (this.value) {
      const date = new Date(this.value);
      // You can add additional formatting here if needed
      console.log('Date selected:', this.value);
    }
  });

  // Left navigation links functionality
  const profileNavLinks = document.querySelectorAll('.profile-nav-link');
  
  console.log('Found profile nav links:', profileNavLinks.length);
  
  // Add specific event listener for logout button (same as Settings page)
  const logoutLink = document.querySelector('.profile-nav-link.logout');
  if (logoutLink) {
    console.log('Logout link found:', logoutLink);
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Logout link clicked directly');
      logout();
    });
  } else {
    console.log('Logout link not found');
  }
  
  profileNavLinks.forEach((link, index) => {
    console.log(`Link ${index}:`, link.href, link.textContent.trim());
    
    link.addEventListener('click', function(e) {
      e.preventDefault();
      console.log(`Clicked link ${index}:`, link.textContent.trim());
      
      // Handle each link based on its href or position
      if (link.href.includes('my-profile.html') || link.textContent.trim() === 'My Profile') {
        console.log('My Profile clicked');
        navigateToMyProfile();
      } else if (link.href.includes('Settings.html') || link.textContent.trim() === 'Settings') {
        console.log('Navigating to Settings');
        navigateToSettings();
      } else if (link.href.includes('privacy-policy.html') || link.textContent.trim() === 'Privacy and Policy') {
        console.log('Navigating to Privacy Policy');
        navigateToPrivacyPolicy();
      } else if (link.href.includes('terms-conditions.html') || link.textContent.trim() === 'Terms and Conditions') {
        console.log('Navigating to Terms and Conditions');
        navigateToTerms();
      } else if (link.classList.contains('logout') || link.textContent.trim() === 'Log out') {
        console.log('Logout clicked');
        logout();
      } else {
        console.log('Unknown link clicked:', link.textContent.trim());
        showNotification("🔗 Link clicked: " + link.textContent.trim(), "info");
      }
    });
    
    // Add visual feedback on hover
    link.addEventListener('mouseenter', function() {
      this.style.transform = 'translateX(5px)';
      this.style.transition = 'transform 0.2s ease';
    });
    
    link.addEventListener('mouseleave', function() {
      this.style.transform = 'translateX(0)';
    });
  });

  // Header navigation functionality
  const notificationHeader = document.querySelector('.header-item:first-of-type');
  if (notificationHeader) {
    notificationHeader.addEventListener('click', function(e) {
      // Let the default link behavior happen
    });
  }

  const profileHeader = document.querySelector('.header-item:last-of-type');
  if (profileHeader) {
    profileHeader.addEventListener('click', function(e) {
      e.preventDefault();
      showNotification("👤 You are already on the profile page!", "info");
    });
  }

  // Search functionality
  const searchInput = document.querySelector('.search-input');
  const searchButton = document.querySelector('.search-button');
  
  if (searchInput && searchButton) {
    const performSearch = () => {
      const query = searchInput.value.trim();
      if (query) {
        showNotification(`🔍 Searching for "${query}"...`, "info");
      } else {
        showNotification("🔍 Please enter a search term!", "info");
      }
    };

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
});
