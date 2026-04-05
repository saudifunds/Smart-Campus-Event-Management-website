// NOTE: Backend does not yet implement real email sending.
// This flow simulates a reset by calling backend endpoints.

async function sendResetCode() {
  const emailInput = document.getElementById("resetEmail").value.trim();
  const message = document.getElementById("resetMessage");

  if (!emailInput) {
    message.style.color = "red";
    message.textContent = "Please enter your email.";
    return;
  }

  try {
    const data = await apiRequest("/auth/forgot-demo", {
      method: "POST",
      body: JSON.stringify({ email: emailInput }),
    });

    message.style.color = "green";
    message.textContent = `A reset code has been generated. (For demo: ${data.code})`;

    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
  } catch (err) {
    message.style.color = "red";
    message.textContent = err.message || "Unable to start reset process.";
  }
}

async function resetPassword() {
  const code = document.getElementById("resetCode").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();
  const message = document.getElementById("resetMessage");

  if (!code || !newPassword) {
    message.style.color = "red";
    message.textContent = "Enter the code and a new password.";
    return;
  }

  try {
    await apiRequest("/auth/reset-demo", {
      method: "POST",
      body: JSON.stringify({ code, newPassword }),
    });

    message.style.color = "green";
    message.textContent = "Password changed successfully! Redirecting...";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (err) {
    message.style.color = "red";
    message.textContent = err.message || "Unable to reset password.";
  }
}
