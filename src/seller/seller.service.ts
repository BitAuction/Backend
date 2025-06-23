import { Injectable, Logger } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { Cron } from '@nestjs/schedule';
import { NotificationService } from 'src/notification/notification.service';
import { extractUserId } from 'src/utils/utils';
import { AuctionService } from 'src/auction/auction.service';

export interface AuctionPayload {
  auction: unknown;
}

export interface AuctionDetails {
  organizations: string[];
  winner: string;
}

@Injectable()
export class SellerService {
  constructor(
    private readonly fabricService: FabricService,
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationService: NotificationService,
    private readonly auctionService: AuctionService,
  ) {}

  private readonly logger = new Logger(SellerService.name);

  async createAuction(
    org: string,
    userId: string,
    auctionID: string,
    item: string,
    timelimit?: string,
    description?: string,
    pictureUrl?: string,
  ) {
    const { contract, gateway } = await this.fabricService.getContract(
      org,
      userId,
    );
    const statefulTxn = contract.createTransaction('CreateAuction');
    if (!timelimit) {
      const now = new Date();
      const after30Seconds = new Date(now.getTime() + 200 * 1000); // 100 seconds in ms
      timelimit = after30Seconds.toISOString();
    }

    await statefulTxn.submit(
      auctionID,
      item,
      timelimit,
      description || '',
      pictureUrl || '',
    );
    const result = await contract.evaluateTransaction(
      'QueryAuction',
      auctionID,
    );
    gateway.disconnect();
    return JSON.parse(result.toString()) as AuctionPayload;
  }

  async endAuction(org: string, userId: string, auctionID: string) {
    const { contract, gateway } = await this.fabricService.getContract(
      org,
      userId,
    );
    const auctionString = await contract.evaluateTransaction(
      'QueryAuction',
      auctionID,
    );
    const auctionJSON = JSON.parse(auctionString.toString()) as AuctionDetails;
    const statefulTxn = contract.createTransaction('EndAuction');
    statefulTxn.setEndorsingOrganizations(...auctionJSON.organizations);
    await statefulTxn.submit(auctionID);
    const result = await contract.evaluateTransaction(
      'QueryAuction',
      auctionID,
    );
    // Send notification to auction winner
    const endedAuction = JSON.parse(result.toString()) as AuctionDetails;
    const winnerId = extractUserId(endedAuction.winner);
    if (winnerId) {
      const notification = await this.notificationService.createNotification(
        winnerId,
        auctionID,
        'winner',
      );
      this.notificationGateway.notifyWinner(
        notification.id,
        winnerId,
        auctionID,
      );
    }
    gateway.disconnect();
    return JSON.parse(result.toString()) as AuctionPayload;
  }

  @Cron('* * * * *') // every 1 minute
  async checkAuctionTimeouts() {
    // TODO: Add db support
    try {
      // Get all open auctions from all organizations (adjust orgs as needed)
      const organizations = ['Org1', 'Org2', 'Org3', 'Org4'];
      for (const org of organizations) {
        try {
          const result = await this.auctionService.getAllOpenAuctions(
            org,
            'admin',
          );
          const auctions = result.auctions || [];
          const now = new Date().toISOString();
          for (const auction of auctions) {
            const sellerId = extractUserId(auction.seller) ?? '';
            const exist = await this.notificationService.notificationExist(
              auction.auctionID,
              sellerId,
              'timeout',
            ); // avoid duplicate notifications
            if (
              auction.status === 'open' &&
              auction.timelimit < now &&
              !exist
            ) {
              this.logger.log(
                `[Timeout] Auction ${auction.auctionID} has passed time limit`,
              );
              const notification =
                await this.notificationService.createNotification(
                  sellerId,
                  auction.auctionID,
                  'timeout',
                );
              this.notificationGateway.notifyTimeout(
                notification.id,
                sellerId,
                auction.auctionID,
              );
            }
          }
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'message' in error) {
            this.logger.warn(
              `Failed to check auctions for org ${org}: ${(error as { message: string }).message}`,
            );
          } else {
            this.logger.warn(
              `Failed to check auctions for org ${org}: ${String(error)}`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error checking auctions: ${error}`);
    }
  }

  // async viewAuction(org: string, userId: string, auctionID: string) {
  //   const { contract, gateway } = await this.fabricService.getContract(org, userId);
  //   let result = await contract.evaluateTransaction('QueryAuction', auctionID);
  //   gateway.disconnect();
  //   return { auction: JSON.parse(result.toString()) };
  // }
}
