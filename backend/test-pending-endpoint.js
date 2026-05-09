const http = require("http");
const { generateToken } = require("./src/middleware/auth");

// Generate a valid admin token
const adminToken = generateToken({
  id: 2,
  role: "Admin",
  position: null,
});

console.log("🧪 Testing /api/events/pending/list endpoint\n");
console.log("Token:", adminToken.substring(0, 50) + "...\n");

const options = {
  hostname: "localhost",
  port: 4000,
  path: "/api/events/pending/list",
  method: "GET",
  headers: {
    Authorization: `Bearer ${adminToken}`,
    "Content-Type": "application/json",
  },
};

const req = http.request(options, (res) => {
  let data = "";

  console.log("Response Status:", res.statusCode);
  console.log("Response Headers:", res.headers);
  console.log("");

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("Response Body:");
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      console.log(
        "\n✅ Total events returned:",
        Array.isArray(parsed) ? parsed.length : "N/A",
      );
    } catch (e) {
      console.log(data);
    }
  });
});

req.on("error", (error) => {
  console.log("❌ Error:", error.message);
});

req.end();
