import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { BiddingService } from '../bidding/bidding.service';
import { AuctionService } from '../auction/auction.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class BidMonitorService {
  private readonly logger = new Logger(BidMonitorService.name);
  private activeAuctions = new Map<string, any>();
  private lastHighestBids = new Map<string, any>();

  constructor(
    private readonly biddingService: BiddingService,
    private readonly auctionService: AuctionService,
    private readonly redisService: RedisService,
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
      // Get all open auctions from all organizations (adjust orgs as needed)
      const organizations = ['org1', 'org2', 'org3', 'org4'];
      for (const org of organizations) {
        try {
          const result = await this.auctionService.getAllOpenAuctions(org, 'admin');
          const auctions = result.auctions || [];
          for (const auction of auctions) {
            await this.checkAuctionBids(org, auction.auctionID);
          }
        } catch (error) {
          this.logger.warn(`Failed to check auctions for org ${org}:`, error.message);
        }
      }
    } catch (error) {
      this.logger.error('Error checking auctions:', error);
    }
  }

  private async checkAuctionBids(org: string, auctionId: string) {
    try {
      const currentHighestBid = await this.biddingService.getHighestBid(org, 'admin', auctionId);
      const lastBid = this.lastHighestBids.get(auctionId);
      if (!lastBid || (currentHighestBid && (
        lastBid.price !== currentHighestBid.price ||
        lastBid.bidder !== currentHighestBid.bidder
      ))) {
        if (currentHighestBid) {
          this.logger.log(`New highest bid for auction ${auctionId}: ${currentHighestBid.price} by ${currentHighestBid.bidder}`);
          this.lastHighestBids.set(auctionId, currentHighestBid);
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