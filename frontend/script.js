const api = "/api/workouts";
const authApi = "/auth";

// Store element references (populated after DOM ready)
let loginPage, mainPage, authForm, exerciseForm, table, userEmailSpan, noDataMsg;
let authEmailInput, authPasswordInput, loginBtn, signupBtn, logoutBtn;
let authError, formError;

// Initialize all event listeners and DOM references
function initializeApp() {
  // Get DOM elements
  loginPage = document.getElementById("loginPage");
  mainPage = document.getElementById("mainPage");
  authForm = document.getElementById("authForm");
  exerciseForm = document.getElementById("exerciseForm");
  table = document.getElementById("table");
  userEmailSpan = document.getElementById("userEmail");
  noDataMsg = document.getElementById("noDataMsg");

  authEmailInput = document.getElementById("authEmail");
  authPasswordInput = document.getElementById("authPassword");
  loginBtn = document.getElementById("loginBtn");
  signupBtn = document.getElementById("signupBtn");
  logoutBtn = document.getElementById("logoutBtn");

  authError = document.getElementById("authError");
  formError = document.getElementById("formError");

  // Debug: Log if any elements are missing
  console.log("DOM Elements check:", {
    loginPage: !!loginPage,
    mainPage: !!mainPage,
    table: !!table,
    loginBtn: !!loginBtn,
    signupBtn: !!signupBtn,
    logoutBtn: !!logoutBtn
  });

  // Setup event listeners
  setupEventListeners();
  
  // Check authentication status
  console.log("Starting auth check...");
  checkAuthStatus();
}

function setupEventListeners() {
  if (!loginBtn) return;
  
  // Login handler
  loginBtn.addEventListener("click", handleLogin);
  
  // Signup handler
  signupBtn.addEventListener("click", handleSignup);
  
  // Logout handler
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
  
  // Form submit handler
  if (exerciseForm) {
    exerciseForm.addEventListener("submit", handleFormSubmit);
  }
}

// Check authentication status on page load
async function checkAuthStatus() {
  try {
    const res = await fetch(`${authApi}/status`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.authenticated) {
        showMainPage(data.email);
        load();
      } else {
        showLoginPage();
      }
    } else {
      showLoginPage();
    }
  } catch (err) {
    console.error("Error checking auth status:", err);
    showLoginPage();
  }
}

function showLoginPage() {
  loginPage.classList.remove("d-none");
  mainPage.classList.add("d-none");
  clearAuthForm();
}

function showMainPage(email) {
  loginPage.classList.add("d-none");
  mainPage.classList.remove("d-none");
  userEmailSpan.textContent = `Logged in as: ${email}`;
  // Set today's date as default when showing form
  document.getElementById("date").valueAsDate = new Date();
}

function clearAuthForm() {
  authEmailInput.value = "";
  authPasswordInput.value = "";
  authError.classList.add("d-none");
  authError.textContent = "";
}

// Login handler
async function handleLogin() {
  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value;
  
  if (!email || !password) {
    showAuthError("Please enter email and password");
    return;
  }
  
  try {
    const res = await fetch(`${authApi}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      showAuthError(data.message || "Login failed");
      return;
    }
    
    showMainPage(email);
    load();
  } catch (err) {
    console.error("Login error:", err);
    showAuthError("An error occurred. Please try again.");
  }
}

// Signup handler
async function handleSignup() {
  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value;
  
  if (!email || !password) {
    showAuthError("Please enter email and password");
    return;
  }
  
  if (password.length < 6) {
    showAuthError("Password must be at least 6 characters");
    return;
  }
  
  try {
    const res = await fetch(`${authApi}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      showAuthError(data.message || "Signup failed");
      return;
    }
    
    // After successful signup, auto-login
    showAuthError("");
    authError.classList.add("d-none");
    
    const loginRes = await fetch(`${authApi}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    
    if (loginRes.ok) {
      showMainPage(email);
      load();
    }
  } catch (err) {
    console.error("Signup error:", err);
    showAuthError("An error occurred. Please try again.");
  }
}

// Logout handler
async function handleLogout() {
  try {
    await fetch(`${authApi}/logout`, { method: "POST" });
    showLoginPage();
    location.reload();
  } catch (err) {
    console.error("Logout error:", err);
    alert("Error logging out");
  }
}

// Form submit handler
async function handleFormSubmit(e) {
  e.preventDefault();
  hideFormError();
  
  const workoutData = {
    exercise: document.getElementById("exercise").value.trim(),
    muscleGroup: document.getElementById("muscleGroup").value,
    duration: parseInt(document.getElementById("duration").value),
    calories: parseInt(document.getElementById("calories").value),
    intensity: document.getElementById("intensity").value,
    date: document.getElementById("date").value,
    notes: document.getElementById("notes").value.trim()
  };
  
  // Basic validation
  if (!workoutData.exercise || !workoutData.muscleGroup || !workoutData.intensity) {
    showFormError("Please fill in all required fields");
    return;
  }
  
  if (isNaN(workoutData.duration) || workoutData.duration <= 0) {
    showFormError("Duration must be a positive number");
    return;
  }
  
  if (isNaN(workoutData.calories) || workoutData.calories < 0) {
    showFormError("Calories must be a non-negative number");
    return;
  }
  
  try {
    const res = await fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workoutData)
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      showFormError(data.message || "Error creating workout");
      return;
    }
    
    exerciseForm.reset();
    document.getElementById("date").valueAsDate = new Date();
    hideFormError();
    load();
  } catch (err) {
    console.error("Error creating workout:", err);
    showFormError("An error occurred. Please try again.");
  }
}

function showAuthError(message) {
  authError.textContent = message;
  authError.classList.remove("d-none");
}

function showFormError(message) {
  formError.textContent = message;
  formError.classList.remove("d-none");
}

function hideFormError() {
  formError.classList.add("d-none");
  formError.textContent = "";
}

// Load and display workouts
async function load() {
  try {
    const res = await fetch(api);
    const data = await res.json();
    
    table.innerHTML = "";
    
    if (!data || data.length === 0) {
      noDataMsg.classList.remove("d-none");
      return;
    }
    
    noDataMsg.classList.add("d-none");
    
    data.forEach(w => {
      const dateObj = new Date(w.date);
      const dateStr = dateObj.toLocaleDateString();
      
      table.innerHTML += `
        <tr>
          <td>${escapeHtml(w.exercise)}</td>
          <td>${escapeHtml(w.muscleGroup || "N/A")}</td>
          <td>${w.duration}</td>
          <td>${w.calories}</td>
          <td><span class="badge bg-${getIntensityColor(w.intensity)}">${escapeHtml(w.intensity || "N/A")}</span></td>
          <td>${dateStr}</td>
          <td>${escapeHtml(w.notes || "-")}</td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="editWorkout('${w._id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteWorkout('${w._id}')">Delete</button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error("Error loading workouts:", err);
    showFormError("Error loading workouts");
  }
}

function getIntensityColor(intensity) {
  switch(intensity) {
    case "Low": return "success";
    case "Medium": return "warning";
    case "High": return "danger";
    default: return "secondary";
  }
}

// Add/Create workout
// Edit workout
async function editWorkout(id) {
  try {
    const res = await fetch(`${api}/${id}`);
    const workout = await res.json();
    
    // Populate form with current values
    document.getElementById("exercise").value = workout.exercise;
    document.getElementById("muscleGroup").value = workout.muscleGroup;
    document.getElementById("duration").value = workout.duration;
    document.getElementById("calories").value = workout.calories;
    document.getElementById("intensity").value = workout.intensity;
    document.getElementById("date").value = workout.date;
    document.getElementById("notes").value = workout.notes || "";
    
    // Scroll to form
    document.getElementById("exerciseForm").scrollIntoView({ behavior: "smooth" });
    
    // Replace submit button with update button
    const form = document.getElementById("exerciseForm");
    const originalSubmitBtn = form.querySelector("button[type='submit']");
    const updateBtn = document.createElement("button");
    updateBtn.type = "button";
    updateBtn.className = "btn btn-warning w-100";
    updateBtn.textContent = "Update Workout";
    
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn btn-secondary w-100 mt-2";
    cancelBtn.textContent = "Cancel";
    
    originalSubmitBtn.replaceWith(updateBtn);
    form.appendChild(cancelBtn);
    
    updateBtn.addEventListener("click", async () => {
      const updatedData = {
        exercise: document.getElementById("exercise").value.trim(),
        muscleGroup: document.getElementById("muscleGroup").value,
        duration: parseInt(document.getElementById("duration").value),
        calories: parseInt(document.getElementById("calories").value),
        intensity: document.getElementById("intensity").value,
        date: document.getElementById("date").value,
        notes: document.getElementById("notes").value.trim()
      };
      
      try {
        const updateRes = await fetch(`${api}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData)
        });
        
        const updateData = await updateRes.json();
        
        if (!updateRes.ok) {
          showFormError(updateData.message || "Error updating workout");
          return;
        }
        
        form.reset();
        document.getElementById("date").valueAsDate = new Date();
        hideFormError();
        
        // Restore original submit button
        updateBtn.replaceWith(originalSubmitBtn);
        cancelBtn.remove();
        
        load();
      } catch (err) {
        console.error("Error updating workout:", err);
        showFormError("An error occurred. Please try again.");
      }
    });
    
    cancelBtn.addEventListener("click", () => {
      form.reset();
      document.getElementById("date").valueAsDate = new Date();
      hideFormError();
      updateBtn.replaceWith(originalSubmitBtn);
      cancelBtn.remove();
    });
    
  } catch (err) {
    console.error("Error fetching workout:", err);
    showFormError("Error loading workout details");
  }
}

// Delete workout
async function deleteWorkout(id) {
  if (!confirm("Are you sure you want to delete this workout?")) {
    return;
  }
  
  try {
    const res = await fetch(`${api}/${id}`, { method: "DELETE" });
    
    if (!res.ok) {
      showFormError("Error deleting workout");
      return;
    }
    
    load();
  } catch (err) {
    console.error("Error deleting workout:", err);
    showFormError("An error occurred. Please try again.");
  }
}

// XSS prevention helper
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM loaded, initializing app");
  initializeApp();
});
