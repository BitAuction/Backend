import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

/**
 * This class is a WebSocket gateway built using NestJS and Socket.IO, allowing real-time bidirectional communication between the server and clients (typically browsers).
 * It manages client connections, handles disconnections, and provides methods to notify users about events like auction endings.
 */
@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
    ],
    credentials: true,
  }, // TODO: adjust for security
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);
  private clients: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.clients.set(userId, client);
      this.logger.log(`Client connected: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.clients.delete(userId);
    this.logger.log(`Client disconnected: ${userId}`);
  }

  notifyUser(userId: string, event: string, data: any) {
    const client = this.clients.get(userId);
    if (client) {
      client.emit(event, data);
    }
  }

  // Call this method when an auction ends
  notifyWinner(notificationId: number, userId: string, auctionId: string) {
    this.notifyUser(userId, 'auction-ended', {
      notificationId,
      auctionId,
      type: 'winner',
    });
  }

  // Call this method when an auction timeout
  notifyTimeout(notificationId: number, sellerId: string, auctionId: string) {
    this.notifyUser(sellerId, 'auction-timeout', {
      notificationId,
      auctionId,
      type: 'timeout',
    });
  }
}
