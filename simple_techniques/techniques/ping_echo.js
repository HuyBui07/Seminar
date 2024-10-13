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

// Ping function to check if a component is online
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

const sources = {
  "test-source": {
    url: "http://localhost:3000/pingecho",
    liveStatus: true,
  },
};

setInterval(async () => {
  for (const source in sources) {
    await ping(sources[source].url)
      .then((response) => {
        if (response) {
          console.info(
            chalk.green(
              `Response received from ${source} at ${new Date().toLocaleTimeString()}`
            )
          );
          if (!sources[source].liveStatus) {
            sendAlert(`:tada: Source ${source} is back up! :tada:`);
            sources[source].liveStatus = true;
          }
        }
      })
      .catch((error) => {
        console.error(
          chalk.red(
            `Error: ${
              error.message
            } for ${source} at ${new Date().toLocaleTimeString()}`
          )
        );
        if (sources[source].liveStatus) {
          sendAlert(
            `:rotating_light: Unable to reach ${source} :rotating_light:`
          );
          sources[source].liveStatus = false;
        }
      });
  }
}, 5000);
