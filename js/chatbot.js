// ====== Simple Rule-Based Chatbot ======

function toggleChatbot() {
  const bot = document.getElementById("chatbotContainer");
  const toggle = document.getElementById("chatbotToggle");
  bot.classList.toggle("active");
  toggle.textContent = bot.classList.contains("active") ? "▼" : "▲";
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

  // Bot reply after short delay
  setTimeout(() => {
    const botDiv = document.createElement("div");
    botDiv.className = "bot-message";
    botDiv.textContent = getBotReply(userText);
    messages.appendChild(botDiv);
    messages.scrollTop = messages.scrollHeight;
  }, 500);
}

// ====== Rule-Based Responses ======
function getBotReply(input) {
  const text = input.toLowerCase();

  if (text.includes("hello") || text.includes("hi")) {
    return "Hello there 👋! How can I help you on Smart Campus today?";
  }
  if (text.includes("book room") || text.includes("reserve room")) {
    return "To book a room, go to the Rooms page and click the '+ Add Room' button (Admins & Staff only).";
  }
  if (text.includes("event")) {
    return "You can view upcoming events on the Events page. Admins and Staff can add or edit events.";
  }
  if (text.includes("password") || text.includes("reset")) {
    return "Go to the Forgot Password page, enter your email, and we’ll send you a reset link.";
  }
  if (text.includes("login") || text.includes("signup")) {
    return "You can login from the Login page or create a new account on the Signup page.";
  }
  if (text.includes("admin")) {
    return "Admins have full control, including user management and data access.";
  }
  if (text.includes("help") || text.includes("assist")) {
    return "Sure! I can help you navigate: try asking about 'rooms', 'events', 'password', or 'admin'.";
  }

  return "Hmm 🤔 I’m not sure about that. Try asking about rooms, events, or password reset.";
}
