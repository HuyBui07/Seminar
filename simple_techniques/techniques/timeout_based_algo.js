import chalk from "chalk";
import dotenv from "dotenv";

dotenv.config();

// Alert function to send a message to a Slack channel
const sendAlert = async (message) => {
  try {
    const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
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

// ping function to check if a component is online
const ping = async (componentURL) => {
  try {
    const response = await fetch(componentURL, {
      method: "GET",
    });
    if (!response.ok) {
      console.error(`Error: Received status code ${response.status}`);
    }
    if (response.ok) {
      return true;
    }
  } catch (error) {
    console.error(`Error sending checking signal: ${error.message}`);
  }
};

// Function to check for downtime
const checkForDowntime = async (source, lastReceived) => {
  const currentTime = Date.now();
  if (currentTime - lastReceived > TIMEOUT_DURATION) {
    console.error(
      chalk.red(
        `Downtime detected for ${source} at ${new Date(
          currentTime
        ).toLocaleTimeString()}`
      )
    );
    await sendAlert(`Downtime detected for ${source}`);
  } else {
    console.info(
      chalk.green(
        `Response received from ${source} at ${new Date(
          lastReceived
        ).toLocaleTimeString()}`
      )
    );
  }
};

const TIMEOUT_DURATION = 5000;

// Create an interval to check component's health every 10 seconds, on each check the component is pinged, 
// if the response is not received within 5 seconds, an alert is sent.
