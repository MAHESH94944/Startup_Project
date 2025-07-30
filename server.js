require("dotenv").config({ quiet: true });
const app = require("./src/app");
const connectDB = require("./src/config/db");

// Connect to DB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
