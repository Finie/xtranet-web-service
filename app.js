const express = require("express");
const userRoute = require("./routes/Users");
const auth = require("./routes/auth");
const server = require("./server/server");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoute);
app.use("/api/auth", auth);



const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`listening on port ${port}`));
