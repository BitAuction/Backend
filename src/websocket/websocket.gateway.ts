import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private clientSubscriptions = new Map<string, Set<string>>(); // clientId -> Set<auctionId>
  private redisSubscriptions = new Map<string, boolean>(); // auctionId -> subscribed

  constructor(private readonly redisService: RedisService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Clean up subscriptions
    const clientSubs = this.clientSubscriptions.get(client.id);
    if (clientSubs) {
      clientSubs.forEach(auctionId => {
        this.removeClientFromAuction(client.id, auctionId);
      });
      this.clientSubscriptions.delete(client.id);
    }
  }

  @SubscribeMessage('subscribe_to_auction')
  async handleSubscribeToAuction(client: Socket, auctionId: string) {
    try {
      this.logger.log(`Client ${client.id} subscribing to auction ${auctionId}`);
      
      // Join the room for this auction
      await client.join(`auction:${auctionId}`);
      
      // Track the subscription
      if (!this.clientSubscriptions.has(client.id)) {
        this.clientSubscriptions.set(client.id, new Set());
      }
      this.clientSubscriptions.get(client.id)?.add(auctionId);

      // Subscribe to Redis updates for this auction (only once per auction)
      if (!this.redisSubscriptions.has(auctionId)) {
        await this.redisService.subscribeToBidUpdates(auctionId, (data) => {
          this.server.to(`auction:${auctionId}`).emit('bid_update', data);
        });
        this.redisSubscriptions.set(auctionId, true);
        this.logger.log(`Redis subscription created for auction ${auctionId}`);
      }

      client.emit('subscribed', { auctionId, success: true });
    } catch (error) {
      this.logger.error(`Error subscribing to auction ${auctionId}:`, error);
      client.emit('subscribed', { auctionId, success: false, error: error.message });
    }
  }

  @SubscribeMessage('unsubscribe_from_auction')
  async handleUnsubscribeFromAuction(client: Socket, auctionId: string) {
    try {
      this.logger.log(`Client ${client.id} unsubscribing from auction ${auctionId}`);
      
      this.removeClientFromAuction(client.id, auctionId);
      
      client.emit('unsubscribed', { auctionId, success: true });
    } catch (error) {
      this.logger.error(`Error unsubscribing from auction ${auctionId}:`, error);
      client.emit('unsubscribed', { auctionId, success: false, error: error.message });
    }
  }

  private removeClientFromAuction(clientId: string, auctionId: string) {
    // Leave the room
    this.server.sockets.sockets.get(clientId)?.leave(`auction:${auctionId}`);
    
    // Remove from tracking
    this.clientSubscriptions.get(clientId)?.delete(auctionId);
    
    // Check if no more clients are subscribed to this auction
    let hasOtherClients = false;
    for (const [cid, subscriptions] of this.clientSubscriptions.entries()) {
      if (cid !== clientId && subscriptions.has(auctionId)) {
        hasOtherClients = true;
        break;
      }
    }
    
    // If no more clients, remove Redis subscription
    if (!hasOtherClients && this.redisSubscriptions.has(auctionId)) {
      this.redisSubscriptions.delete(auctionId);
      this.logger.log(`Removed Redis subscription for auction ${auctionId} - no more clients`);
    }
  }

  // Method to broadcast bid updates to all clients subscribed to an auction
  async broadcastBidUpdate(auctionId: string, bidData: any) {
    this.server.to(`auction:${auctionId}`).emit('bid_update', bidData);
  }
} 