const mongoose = require("mongoose");
require("dotenv/config");
mongoose
  .connect(process.env.DB_CONNECTION, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("Connected to the DB sucessfully"))
  .catch((err) => console.log("Failed to connect to database", err));
