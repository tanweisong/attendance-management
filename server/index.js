const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors());

const login = require("./routes/api/login");
const table = require("./routes/api/table");

app.use("/api/login", login);
app.use("/api/table", table);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
