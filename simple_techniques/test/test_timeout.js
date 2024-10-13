const express = require("express");
const fetch = require("node-fetch");

const app = express();
const port = 3000;

app.get("/timeout", async (req, res) => {
  // Simulate a slow response
  await new Promise((resolve) => setTimeout(resolve, 60000));
  res.send("Response received");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});