const HEARTBEAT_URL = 'http://localhost:3000/heartbeat';
const SOURCE_NAME = 'test-source';

const sendHeartbeat = async () => {
    try {
        const response = await fetch(HEARTBEAT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source: SOURCE_NAME })
        });
        if (response.ok) {
            console.log(`Heartbeat sent from ${SOURCE_NAME} at ${new Date().toLocaleTimeString()}`);
        } else {
            console.error(`Failed to send heartbeat: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error sending heartbeat: ${error.message}`);
    }
};

// Send a heartbeat immediately for testing
sendHeartbeat();