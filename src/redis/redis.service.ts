import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private publisher: RedisClientType;
  private subscriber: RedisClientType;

  async onModuleInit() {
    // Create publisher client
    this.publisher = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    // Create subscriber client
    this.subscriber = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    await this.publisher.connect();
    await this.subscriber.connect();

    console.log('Redis clients connected');
  }

  async onModuleDestroy() {
    await this.publisher.quit();
    await this.subscriber.quit();
  }

  async publishBidUpdate(auctionId: string, bidData: any) {
    const channel = `auction:${auctionId}:bids`;
    await this.publisher.publish(channel, JSON.stringify(bidData));
  }

  async subscribeToBidUpdates(auctionId: string, callback: (data: any) => void) {
    const channel = `auction:${auctionId}:bids`;
    await this.subscriber.subscribe(channel, (message) => {
      try {
        const data = JSON.parse(message);
        callback(data);
      } catch (error) {
        console.error('Error parsing bid update message:', error);
      }
    });

    return () => {
      this.subscriber.unsubscribe(channel);
    };
  }

  async getPublisher() {
    return this.publisher;
  }

  async getSubscriber() {
    return this.subscriber;
  }
} 