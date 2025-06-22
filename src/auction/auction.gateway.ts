import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
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

  // Call this method when an auction ends
  notifyWinner(userId: string, auctionId: string) {
    const client = this.clients.get(userId);
    if (client) {
      client.emit('auction-ended', {
        message: `🎉 You won the auction ${auctionId}!`,
        auctionId,
      });
    }
  }
}
