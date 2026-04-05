// ====== Simple Rule-Based Chatbot ======

function toggleChatbot() {
  const bot = document.getElementById("chatbotContainer");
  const toggle = document.getElementById("chatbotToggle");
  bot.classList.toggle("active");
  toggle.textContent = bot.classList.contains("active") ? "" : "";
}

function sendMessage() {
  const input = document.getElementById("chatbotInput");
  const messages = document.getElementById("chatbotMessages");
  const userText = input.value.trim();
  if (!userText) return;

  // Display user message
  const userDiv = document.createElement("div");
  userDiv.className = "user-message";
  userDiv.textContent = userText;
  messages.appendChild(userDiv);

  // Clear input
  input.value = "";
  input.focus();

  // Show typing indicator
  const typingDiv = document.createElement("div");
  typingDiv.className = "bot-message typing-indicator";
  typingDiv.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  messages.appendChild(typingDiv);
  messages.scrollTop = messages.scrollHeight;

  // Bot reply after very short delay (100ms for instant feel)
  setTimeout(() => {
    typingDiv.remove();
    const botDiv = document.createElement("div");
    botDiv.className = "bot-message";
    botDiv.textContent = getBotReply(userText);
    messages.appendChild(botDiv);
    messages.scrollTop = messages.scrollHeight;
  }, 100);
}

// Allow Enter key to send message
document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("chatbotInput");
  if (input) {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    });
  }
});

// ====== Rule-Based Responses ======
function getBotReply(input) {
  const text = input.toLowerCase();

  // Greeting
  if (text.includes("hello") || text.includes("hi") || text.match(/^hi[!?]?Out-String/) || text.match(/^hello[!?]?Out-String/)) {
    return "Hello there ! How can I help you on Smart Campus today? Ask me about events, rooms, accounts, or anything else!";
  }
  
  // Room booking & management
  if (text.includes("book") || text.includes("reserve") || text.includes("room")) {
    return " To book or view rooms, go to the Rooms page. Admins & Staff can add/edit rooms. Students can view available rooms.";
  }
  
  // Events
  if (text.includes("event")) {
    return " Check the Events page to view all upcoming campus events with times and venues. Admins & Staff can create new events.";
  }
  
  // Password reset
  if (text.includes("password") || text.includes("reset") || text.includes("forgot")) {
    return " Forgot your password? Go to Forgot Password page, enter your email, and check your inbox for the reset link.";
  }
  
  // Authentication
  if (text.includes("login") || text.includes("signup") || text.includes("register")) {
    return " Use the Login page to access your account. New users can create an account on the Signup page.";
  }
  
  // Roles & permissions
  if (text.includes("admin") || text.includes("staff") || text.includes("student") || text.includes("role")) {
    return " Three roles exist: Admin (full control), Staff (manage events/rooms), Student (view only). Your role determines what you can access.";
  }
  
  // Help
  if (text.includes("help") || text.includes("assist") || text.includes("support")) {
    return " I can help! Ask me about: events, rooms, login/signup, password reset, roles, or general campus questions. What do you need?";
  }
  
  // Dashboard/home
  if (text.includes("dashboard") || text.includes("home") || text.includes("main")) {
    return " You're on the main Dashboard! It shows role-specific content. Use the sidebar to navigate to Events, Rooms, or Users.";
  }
  
  // Thanks
  if (text.includes("thank") || text.includes("thanks") || text.includes("appreciate")) {
    return " Happy to help! Let me know if you have any other questions about Smart Campus.";
  }

  // Fallback with suggestions
  return " I didn't quite catch that. Try asking about:\n  Events\n  Rooms\n  Login/Signup\n  Password reset\n  Roles & permissions";
}
