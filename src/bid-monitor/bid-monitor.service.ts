import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { BiddingService } from '../bidding/bidding.service';
import { AuctionService } from '../auction/auction.service';
import { RedisService } from '../redis/redis.service';
import { SimulationService } from '../simulation/simulation.service';

@Injectable()
export class BidMonitorService {
  private readonly logger = new Logger(BidMonitorService.name);
  private activeAuctions = new Map<string, any>();
  private lastHighestBids = new Map<string, any>();

  constructor(
    private readonly biddingService: BiddingService,
    private readonly auctionService: AuctionService,
    private readonly redisService: RedisService,
    private readonly simulationService: SimulationService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async startMonitoring() {
    // Poll every 2 seconds for updates
    const job = new CronJob('*/2 * * * * *', () => {
      this.checkAllAuctions();
    });

    this.schedulerRegistry.addCronJob('bid-monitor', job);
    job.start();

    this.logger.log('Bid monitoring started');
  }

  async stopMonitoring() {
    const job = this.schedulerRegistry.getCronJob('bid-monitor');
    if (job) {
      job.stop();
      this.schedulerRegistry.deleteCronJob('bid-monitor');
    }
    this.logger.log('Bid monitoring stopped');
  }

  private async checkAllAuctions() {
    try {
      // Get all open auctions from simulation
      const result = await this.auctionService.getAllOpenAuctions('org1', 'admin');
      const auctions = result.auctions || [];
      
      for (const auction of auctions) {
        await this.checkAuctionBids(auction.auctionID);
      }
    } catch (error) {
      this.logger.error('Error checking auctions:', error);
    }
  }

  private async checkAuctionBids(auctionId: string) {
    try {
      const currentHighestBid = await this.biddingService.getHighestBid('org1', 'admin', auctionId);
      const lastBid = this.lastHighestBids.get(auctionId);

      // Check if the highest bid has changed
      if (!lastBid || 
          (currentHighestBid && (
            lastBid.price !== currentHighestBid.price || 
            lastBid.bidder !== currentHighestBid.bidder
          ))) {
        
        if (currentHighestBid) {
          this.logger.log(`New highest bid for auction ${auctionId}: ${currentHighestBid.price} by ${currentHighestBid.bidder}`);
          
          // Update the last known bid
          this.lastHighestBids.set(auctionId, currentHighestBid);
          
          // Publish the update to Redis
          await this.redisService.publishBidUpdate(auctionId, {
            type: 'highest_bid_update',
            auctionId,
            highestBid: currentHighestBid,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to check bids for auction ${auctionId}:`, error.message);
    }
  }

  // Method to simulate random bids for testing
  async startRandomBidSimulation() {
    const simulationJob = new CronJob('*/5 * * * * *', async () => {
      try {
        const result = await this.auctionService.getAllOpenAuctions('org1', 'admin');
        const auctions = result.auctions || [];
        
        if (auctions.length > 0) {
          // Pick a random auction
          const randomAuction = auctions[Math.floor(Math.random() * auctions.length)];
          
          // Simulate a random bid
          const newBid = await this.simulationService.simulateRandomBid(randomAuction.auctionID);
          
          if (newBid) {
            this.logger.log(`Simulated random bid: $${newBid.price} by ${newBid.bidder} for auction ${randomAuction.auctionID}`);
            
            // Publish the update to Redis
            await this.redisService.publishBidUpdate(randomAuction.auctionID, {
              type: 'highest_bid_update',
              auctionId: randomAuction.auctionID,
              highestBid: newBid,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        this.logger.error('Error in random bid simulation:', error);
      }
    });

    this.schedulerRegistry.addCronJob('random-bid-simulation', simulationJob);
    simulationJob.start();

    this.logger.log('Random bid simulation started');
  }

  async stopRandomBidSimulation() {
    const job = this.schedulerRegistry.getCronJob('random-bid-simulation');
    if (job) {
      job.stop();
      this.schedulerRegistry.deleteCronJob('random-bid-simulation');
    }
    this.logger.log('Random bid simulation stopped');
  }

  async addAuctionToMonitor(auctionId: string, auctionData: any) {
    this.activeAuctions.set(auctionId, auctionData);
    this.logger.log(`Added auction ${auctionId} to monitoring`);
  }

  async removeAuctionFromMonitor(auctionId: string) {
    this.activeAuctions.delete(auctionId);
    this.lastHighestBids.delete(auctionId);
    this.logger.log(`Removed auction ${auctionId} from monitoring`);
  }
} 