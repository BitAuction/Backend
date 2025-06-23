import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * This class is a WebSocket gateway built using NestJS and Socket.IO, allowing real-time bidirectional communication between the server and clients (typically browsers).
 * It manages client connections, handles disconnections, and provides methods to notify users about events like auction endings.
 */
@WebSocketGateway({
  cors: { origin: '*' }, // TODO: adjust for security
})
export class AuctionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.clients.set(userId, client);
      console.log(`Client connected: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.clients.delete(userId);
    console.log(`Client disconnected: ${userId}`);
  }

  notifyUser(userId: string, event: string, data: any) {
    const client = this.clients.get(userId);
    if (client) {
      client.emit(event, data);
    }
  }

  // Call this method when an auction ends
  notifyWinner(userId: string, auctionId: string) {
    this.notifyUser(userId, 'auction-ended', {
      auctionId,
      type: 'winner',
    });
  }

  notifyTimeout(sellerId: string, auctionId: string) {
    this.server.emit('auction-timeout', {
      auctionId,
      type: 'timeout',
      userId: sellerId,
    });
  }
}
