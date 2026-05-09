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
    console.log("🔐 Attempting login with:", email);
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    console.log("✅ Login response received:", data);
    console.log("Token in response?", !!data.token);

    setAuthSession(data.user);
    if (data.token) {
      console.log("📝 Saving token to localStorage...");
      setAuthToken(data.token);
      console.log("✅ Token saved. Check localStorage.getItem('authToken')");
    }

    message.style.color = "green";
    message.textContent = "Login successful! Redirecting...";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  } catch (err) {
    console.error("❌ Login error:", err);
    message.style.color = "red";
    message.textContent =
      err.message || "Invalid credentials. Please try again.";
  }
}

// Auto redirect if already logged in
window.onload = () => {
  if (localStorage.getItem("loggedInUser")) {
    window.location.href = "index.html";
  }
};
