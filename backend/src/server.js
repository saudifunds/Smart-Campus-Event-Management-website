require("dotenv").config();
const app = require("./app");
require("./scheduler");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Smart Campus backend is running on http://localhost:${PORT}`);
});


