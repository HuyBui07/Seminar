import express, { json } from "express";
import chalk from "chalk";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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

// Middleware to parse JSON bodies
app.use(json());

// ping function to check if a component is online
const ping = async (componentURL) => {
  console.info(`Checking ${componentURL}`);
  try {
    const response = await fetch(componentURL, {
      method: "GET",
    });
    if (!response.ok) {
      return false;
    }
    if (response.ok) {
      return true;
    }
  } catch (error) {
    console.error(`Error sending checking signal: ${error.message}`);
  }
};

const WAITING_DURATION_IN_MILISECONDS = 10000;
let COUNTDOWN_DURATION_IN_SECONDS = 5;

// Source and URL for the component to be monitored
const sources = {
  "test-source": {
    url: "http://localhost:3000/timeout",
    liveStatus: true,
  },
};

// Create an interval to check component's health every 60 seconds, on each check the component is pinged,
// if the response is not received within 30 seconds, an alert is sent.
setInterval(async () => {
  for (const source in sources) {
    const isOnline = await ping(sources[source].url);
    const countdownInterval = setInterval(() => {
      if (isOnline) {
        clearInterval(countdownInterval);
        COUNTDOWN_DURATION_IN_SECONDS = 30;
        if (!sources[source].liveStatus) {
          sendAlert(`:tada: ${source} is back up! :tada:`);
          sources[source].liveStatus = true;
        }
      }
      COUNTDOWN_DURATION_IN_SECONDS -= 1;
      if (COUNTDOWN_DURATION_IN_SECONDS === 0) {
        sendAlert(`:rotating_light: ${source} is down! :rotating_light:`);
        sources[source].liveStatus = false;
        COUNTDOWN_DURATION_IN_SECONDS = 30;
      }
    }, 1000);
  }
}, WAITING_DURATION_IN_MILISECONDS);