function registerUser() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const role = document.getElementById("signupRole").value;
  const message = document.getElementById("signupMessage");

  if (!name || !email || !password || !role) {
    message.style.color = "red";
    message.textContent = "Please fill all fields.";
    return;
  }

  // Retrieve or create users array
  const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];

  // Check if email already exists
  const exists = users.find((u) => u.email === email);
  if (exists) {
    message.style.color = "red";
    message.textContent = "Email already registered. Please login.";
    return;
  }

  // Save new user
  users.push({ name, email, password, role });
  localStorage.setItem("registeredUsers", JSON.stringify(users));

  message.style.color = "green";
  message.textContent = "Account created successfully! Redirecting...";

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500);
}
