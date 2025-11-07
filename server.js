const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static client
app.use(express.static(path.join(__dirname)));

// Start HTTP server
const server = app.listen(port, () => {
    console.log(`HTTP server running on port ${port}`);
});

// WebSocket server
const wss = new WebSocket.Server({ server });

let videoState = { isPlaying: false, currentTime: 0 };

wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'sync', state: videoState }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'play') {
            videoState.isPlaying = true;
            videoState.currentTime = data.currentTime;
        } else if (data.type === 'pause') {
            videoState.isPlaying = false;
            videoState.currentTime = data.currentTime;
        } else if (data.type === 'stop') {
            videoState.isPlaying = false;
            videoState.currentTime = 0;
        }

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(data));
        });
    });
});
