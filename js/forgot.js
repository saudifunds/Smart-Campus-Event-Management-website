let resetEmail = "";
let generatedCode = "";

function sendResetCode() {
    const emailInput = document.getElementById("resetEmail").value.trim();
    const message = document.getElementById("resetMessage");
    const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    const user = users.find(u => u.email === emailInput);

    if (!user) {
        message.style.color = "red";
        message.textContent = "Email not found. Please check or sign up.";
        return;
    }

    // Generate a random 6-digit reset code
    generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    resetEmail = emailInput;

    // Save code temporarily
    localStorage.setItem("resetCode", generatedCode);
    localStorage.setItem("resetEmail", resetEmail);

    message.style.color = "green";
    message.textContent = `A reset code has been sent to ${emailInput}. (For demo: ${generatedCode})`;

    // Switch to next step
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
}

function resetPassword() {
    const enteredCode = document.getElementById("resetCode").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const message = document.getElementById("resetMessage");

    const savedCode = localStorage.getItem("resetCode");
    const email = localStorage.getItem("resetEmail");
    const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    if (enteredCode !== savedCode) {
        message.style.color = "red";
        message.textContent = "Invalid reset code.";
        return;
    }

    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
        message.style.color = "red";
        message.textContent = "User not found.";
        return;
    }

    users[userIndex].password = newPassword;
    localStorage.setItem("registeredUsers", JSON.stringify(users));

    // Clear temp data
    localStorage.removeItem("resetCode");
    localStorage.removeItem("resetEmail");

    message.style.color = "green";
    message.textContent = "Password changed successfully! Redirecting...";

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
}
