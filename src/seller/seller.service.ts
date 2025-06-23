import { Injectable } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';
import { AuctionGateway } from 'src/auction/auction.gateway';
import { Cron } from '@nestjs/schedule';

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
    private readonly auctionGateway: AuctionGateway,
  ) {}

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
      const after30Seconds = new Date(now.getTime() + 30 * 1000); // 30 seconds in ms
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
    const endedAuction = JSON.parse(result.toString()) as AuctionDetails;
    const winnerId = this.extractUserId(endedAuction.winner);
    if (winnerId) {
      this.auctionGateway.notifyWinner(winnerId, auctionID);
    }
    gateway.disconnect();
    return JSON.parse(result.toString()) as AuctionPayload;
  }

  private extractUserId(x509Identity: string): string | null {
    if (!x509Identity) {
      return null;
    }
    // Extracts the Common Name (CN) from the X.509 string
    const match = x509Identity.match(/CN=([^,]+)/);
    return match ? match[1] : null;
  }

  // runs at minute 0 of every hour
  @Cron('0 * * * *')
  checkAuctionTimeouts() {
    // TODO: Add db support
    const auctions = [
      {
        id: 'auction1',
        sellerId: 'seller_001',
        timelimit: new Date().toISOString(),
        status: 'open',
      },
    ];
    console.log('HELLO WORLD');
    const now = new Date().toISOString();
    for (const auction of auctions) {
      if (auction.status === 'open' && auction.timelimit <= now) {
        console.log(`[Timeout] Auction ${auction.id} has passed time limit`);
        this.auctionGateway.notifyTimeout(auction.sellerId, auction.id);
        auction.status = 'open'; // mark to avoid duplicate notifications
      }
    }
  }

  // async viewAuction(org: string, userId: string, auctionID: string) {
  //   const { contract, gateway } = await this.fabricService.getContract(org, userId);
  //   let result = await contract.evaluateTransaction('QueryAuction', auctionID);
  //   gateway.disconnect();
  //   return { auction: JSON.parse(result.toString()) };
  // }
}
