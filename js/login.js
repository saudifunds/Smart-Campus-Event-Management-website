function loginUser() {
  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("loginMessage");

  const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];

  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    localStorage.setItem("userRole", user.role);

    message.style.color = "green";
    message.textContent = "Login successful! Redirecting...";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  } else {
    message.style.color = "red";
    message.textContent = "Invalid credentials. Please try again.";
  }
}

// Auto redirect if already logged in
window.onload = () => {
  if (localStorage.getItem("loggedInUser")) {
    window.location.href = "index.html";
  }
};
