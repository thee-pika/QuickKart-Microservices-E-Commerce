import express from 'express';
import http from 'http';
import { WebSocket } from 'ws';
import { consumerKafkaMessages } from './logger-consumer';
const app = express();

const wsServer = new WebSocket.Server({ noServer: true });

export const clients = new Set<WebSocket>();

wsServer.on('connection', (ws) => {
  clients.add(ws);

  ws.on('close', () => {
    clients.delete(ws);
  });
});

const server = http.createServer(app);

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (ws) => {
    wsServer.emit('connection', ws, request);
  });
});

const port = process.env.PORT || 5007;

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

consumerKafkaMessages();

server.on('error', console.error);
