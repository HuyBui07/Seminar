import express, { json } from "express";
import chalk from "chalk";
const app = express();
const port = 3000;

// Alert function to send a message to a Slack channel
const sendAlert = async (message) => {
  const SLACK_WEBHOOK_URL =
    "https://hooks.slack.com/services/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";
  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
    if (response.ok) {
      console.info("Alert sent via Slack");
    } else {
      console.error("Failed to send alert via Slack:", response.statusText);
    }
  } catch (error) {
    console.error("Error sending alert via Slack:", error.message);
  }
};
// Middleware to parse JSON bodies
app.use(json());

const heartbeatLastReceived = {
  "test-source": Date.now(),
};
const TIMEOUT_DURATION = 5000;
let lastIntervalId = setInterval(checkForDowntime, TIMEOUT_DURATION);

// Route to handle heartbeat POST requests
app.post("/heartbeat", (req, res) => {
  const { source } = req.body;
  heartbeatLastReceived[source] = Date.now();
  console.info(
    `Received heartbeat from ${source} at ${new Date(
      heartbeatLastReceived[source]
    ).toLocaleTimeString()}`
  );

  // Set an interval to check for downtime every minute
  if (lastIntervalId) {
    clearInterval(lastIntervalId);
  }
  lastIntervalId = setInterval(checkForDowntime, TIMEOUT_DURATION);

  res.status(200).send("Heartbeat received");
});

// Function to check for downtime
function checkForDowntime() {
  const currentTime = Date.now();
  for (const source in heartbeatLastReceived) {
    if (currentTime - heartbeatLastReceived[source] > TIMEOUT_DURATION) {
      console.error(
        chalk.red(
          `Source ${source} is down at ${new Date(
            currentTime
          ).toLocaleTimeString()}`
        )
      );
      sendAlert(`:rotating_light: Source ${source} is down! :rotating_light:`);
    }
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Heartbeat receiver listening at http://localhost:${port}\n`);
});
