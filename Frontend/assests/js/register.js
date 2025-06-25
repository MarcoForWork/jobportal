const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const togglePassword = document.getElementById("toggle-password");
const toggleConfirmPassword = document.getElementById(
  "toggle-confirm-password"
);

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const firstNameInput = document.getElementById("first-name");
const lastNameInput = document.getElementById("last-name");
const phoneInput = document.getElementById("phone");
const dobInput = document.getElementById("dob");
const roleInput = document.getElementById("role");

function setupPasswordToggle(inputElement, toggleElement) {
  toggleElement.addEventListener("click", () => {
    const type = inputElement.getAttribute("type");
    inputElement.setAttribute(
      "type",
      type === "password" ? "text" : "password"
    );
    toggleElement.textContent = type === "password" ? "🙈" : "👁";
  });
}

setupPasswordToggle(passwordInput, togglePassword);
setupPasswordToggle(confirmPasswordInput, toggleConfirmPassword);

/**
 * @returns {boolean}
 */
function validateForm() {
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const phone = phoneInput.value.trim();
  const dob = dobInput.value;
  const role = roleInput.value;

  if (
    !username ||
    !email ||
    !password ||
    !confirmPassword ||
    !firstName ||
    !lastName ||
    !phone ||
    !dob ||
    !role
  ) {
    alert("Please fill in all required fields.");
    return false;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters long.");
    return false;
  }

  if (password !== confirmPassword) {
    alert("Password and Confirm Password do not match.");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return false;
  }

  const phoneRegex = /^\d{10,}$/; // Ít nhất 10 số
  if (!phoneRegex.test(phone)) {
    alert("Please enter a valid phone number (at least 10 digits).");
    return false;
  }

  // Kiểm tra ngày sinh
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age < 18) {
    alert("You must be at least 18 years old to register.");
    return false;
  }

  return true;
}

/**
 * @param {Event} event
 * @returns {boolean}
 */
async function handleRegister(event) {
  event.preventDefault();

  if (!validateForm()) {
    return false;
  }

  const API_URL = "http://localhost:8080/jobportal/api/users";

  const userData = {
    username: usernameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value,
    firstName: firstNameInput.value.trim(),
    lastName: lastNameInput.value.trim(),
    phone: phoneInput.value.trim(),
    dob: dobInput.value, // YYYY-MM-DD format
    role: roleInput.value.trim(),
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const apiResponse = await response.json();
      console.log("Registration successful:", apiResponse);
      showMessageBox("Registration successful! You can now log in.", () => {
        window.location.href = "login.html";
      });
    } else {
      const errorResponse = await response.json();
      console.error("Registration failed:", errorResponse);
      showMessageBox(
        "Registration failed: " +
          (errorResponse.message || "An unexpected error occurred.")
      );
    }
  } catch (error) {
    console.error("Error during registration:", error);
    showMessageBox("An error occurred during registration. Please try again.");
  }

  return false;
}

function showMessageBox(message, callback = () => {}) {
  // Create modal background
  const modalBackground = document.createElement("div");
  modalBackground.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

  // Create modal box
  const modalBox = document.createElement("div");
  modalBox.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        text-align: center;
        max-width: 400px;
        width: 90%;
        font-family: 'Inter', Arial, sans-serif;
    `;

  // Create message element
  const messageText = document.createElement("p");
  messageText.textContent = message;
  messageText.style.cssText = `
        margin-bottom: 20px;
        font-size: 16px;
        color: #333;
    `;

  // Create OK button
  const okButton = document.createElement("button");
  okButton.textContent = "OK";
  okButton.style.cssText = `
        background-color: #007bff;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.2s;
    `;
  okButton.onmouseover = () => (okButton.style.backgroundColor = "#0056b3");
  okButton.onmouseout = () => (okButton.style.backgroundColor = "#007bff");

  okButton.onclick = () => {
    document.body.removeChild(modalBackground);
    callback();
  };

  modalBox.appendChild(messageText);
  modalBox.appendChild(okButton);
  modalBackground.appendChild(modalBox);
  document.body.appendChild(modalBackground);
}
