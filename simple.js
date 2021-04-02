const express = require("express");
const path = require("path");

const app = express();
const router = express.Router();

app.get("/api", async (req, res) => {
  console.log("received an api call");
  const result = { hello: "there" };
  res.status(200).send(result);
});

app.use(express.static(path.join(__dirname, "frontend", "build")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
});

const port = /* process.env.PORT || */ 5000;
const server = app.listen(port, () =>
  console.log(`Listening on port ${port}...`)
);
