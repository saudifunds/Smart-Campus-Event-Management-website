const http = require("http");

console.log("🔍 Testing Backend API...\n");

// Test 1: Check if backend is running
const options = {
  hostname: "localhost",
  port: 4000,
  path: "/api/events/pending/list",
  method: "GET",
  headers: {
    Authorization: "Bearer invalid-token",
  },
};

const req = http.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("✅ Backend API is responding!");
    console.log("Response Status:", res.statusCode);
    console.log("Response Body:", data);

    if (res.statusCode === 401) {
      console.log("\n⚠️  Got 401 - Token is invalid (expected with bad token)");
      console.log("✅ This means the API endpoint works!");
    }
  });
});

req.on("error", (error) => {
  console.log("❌ Cannot connect to backend!");
  console.log("Error:", error.message);
  console.log("\n⚠️  Make sure the backend is running: npm start");
});

req.end();
