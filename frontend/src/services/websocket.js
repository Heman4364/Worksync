import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscribers = new Map();
  }

  connect(onNotificationReceived) {
    if (this.client && this.client.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('[WorkSync WebSocket] Connected to STOMP broker');
        this.client.subscribe('/topic/notifications', (message) => {
          try {
            const data = JSON.parse(message.body);
            if (onNotificationReceived) {
              onNotificationReceived(data);
            }
          } catch (e) {
            console.error('[WorkSync WebSocket] Error parsing notification:', e);
          }
        });
      },
      onStompError: (frame) => {
        console.error('[WorkSync WebSocket] STOMP error:', frame);
      },
    });

    try {
      this.client.activate();
    } catch (e) {
      console.warn('[WorkSync WebSocket] Could not activate STOMP connection:', e);
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;
