const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let videoState = {
  isPlaying: false,
  currentTime: 0
};

wss.on('connection', (ws) => {
  console.log('New client connected');

  // Send current video state to the new client
  ws.send(JSON.stringify({ type: 'sync', state: videoState }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      // Update server state
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

      // Broadcast to all clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (err) {
      console.error(err);
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
});

console.log('WebSocket server running on ws://localhost:8080');
