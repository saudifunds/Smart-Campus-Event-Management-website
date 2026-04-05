async function registerUser() {
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

  try {
    await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });

    message.style.color = "green";
    message.textContent = "Account created successfully! Redirecting to login...";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (err) {
    message.style.color = "red";
    message.textContent = err.message || "Unable to create account.";
  }
}
