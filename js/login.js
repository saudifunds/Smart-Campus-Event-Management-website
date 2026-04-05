async function loginUser() {
  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("loginMessage");

  if (!email || !password) {
    message.style.color = "red";
    message.textContent = "Please enter email and password.";
    return;
  }

  try {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setAuthSession(data.user);

    message.style.color = "green";
    message.textContent = "Login successful! Redirecting...";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  } catch (err) {
    message.style.color = "red";
    message.textContent = err.message || "Invalid credentials. Please try again.";
  }
}

// Auto redirect if already logged in
window.onload = () => {
  if (localStorage.getItem("loggedInUser")) {
    window.location.href = "index.html";
  }
};
