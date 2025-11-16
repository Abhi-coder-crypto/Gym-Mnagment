import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface Client {
  ws: WebSocket;
  sessionId: string;
  userId: string;
  userName: string;
}

const clients = new Map<WebSocket, Client>();
const sessionRooms = new Map<string, Set<WebSocket>>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws/chat'  // Use a specific path to avoid conflicts with Vite
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection to chat');

    ws.on('message', (data: string) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'join':
            handleJoin(ws, message);
            break;
          case 'message':
            handleMessage(ws, message);
            break;
          case 'leave':
            handleLeave(ws);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      handleLeave(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('WebSocket server initialized');
  return wss;
}

function handleJoin(ws: WebSocket, message: any) {
  const { sessionId, userId, userName } = message;
  
  // Store client info
  clients.set(ws, { ws, sessionId, userId, userName });
  
  // Add to session room
  if (!sessionRooms.has(sessionId)) {
    sessionRooms.set(sessionId, new Set());
  }
  sessionRooms.get(sessionId)!.add(ws);
  
  // Notify others in the room
  broadcastToSession(sessionId, {
    type: 'user_joined',
    userName,
    timestamp: new Date().toISOString()
  }, ws);
  
  console.log(`User ${userName} joined session ${sessionId}`);
}

function handleMessage(ws: WebSocket, message: any) {
  const client = clients.get(ws);
  if (!client) return;
  
  const { sessionId, message: text } = message;
  
  // Broadcast message to all clients in the session
  broadcastToSession(sessionId, {
    type: 'message',
    id: Math.random().toString(36).substring(7),
    sessionId,
    userId: client.userId,
    userName: client.userName,
    message: text,
    timestamp: new Date().toISOString()
  });
  
  console.log(`Message from ${client.userName} in session ${sessionId}: ${text}`);
}

function handleLeave(ws: WebSocket) {
  const client = clients.get(ws);
  if (!client) return;
  
  const { sessionId, userName } = client;
  
  // Remove from session room
  const room = sessionRooms.get(sessionId);
  if (room) {
    room.delete(ws);
    if (room.size === 0) {
      sessionRooms.delete(sessionId);
    }
  }
  
  // Remove client
  clients.delete(ws);
  
  // Notify others
  broadcastToSession(sessionId, {
    type: 'user_left',
    userName,
    timestamp: new Date().toISOString()
  });
  
  console.log(`User ${userName} left session ${sessionId}`);
}

function broadcastToSession(sessionId: string, message: any, excludeWs?: WebSocket) {
  const room = sessionRooms.get(sessionId);
  if (!room) return;
  
  const messageStr = JSON.stringify(message);
  
  room.forEach((clientWs) => {
    if (clientWs !== excludeWs && clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(messageStr);
    }
  });
}
