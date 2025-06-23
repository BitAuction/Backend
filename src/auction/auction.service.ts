import { Injectable } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';

export interface Bid {
  objectType: 'bid';
  price: number;
  org: string;
  bidder: string;
  valid: boolean;
  timestamp: string; // ISO string
}

export interface Auction {
  auctionID: string;
  objectType: 'auction';
  item: string;
  seller: string;
  organizations: string[];
  winner: string;
  price: number;
  status: 'open' | 'ended';
  timelimit: string; // ISO string
  description: string;
  pictureUrl: string;
  bids: Bid[];
}

export interface AllOpenAuctionsResult {
  auctions: Auction[];
}

@Injectable()
export class AuctionService {
  constructor(private readonly fabricService: FabricService) {}

  async getAllOpenAuctions(
    org: string,
    userId: string,
  ): Promise<AllOpenAuctionsResult> {
    const { contract, gateway } = await this.fabricService.getContract(
      org,
      userId,
    );
    try {
      const bufferResult =
        await contract.evaluateTransaction('GetAllOpenAuctions');
      gateway.disconnect();
      const auctions: Auction[] =
        (JSON.parse(bufferResult.toString()) as Auction[]) || [];
      return { auctions: auctions };
    } catch (error) {
      gateway.disconnect();
      throw error;
    }
  }

  async getAllAuctionsByUser(org: string, userId: string) {
    const { contract, gateway } = await this.fabricService.getContract(
      org,
      userId,
    );
    try {
      let result = await contract.evaluateTransaction(
        'GetAllAuctionsBySeller',
        userId,
      );
      gateway.disconnect();
      return { auctions: JSON.parse(result.toString()) };
    } catch (error) {
      gateway.disconnect();
      throw error;
    }
  }

  async getAuctionDetails(org: string, userId: string, auctionID: string) {
    const { contract, gateway } = await this.fabricService.getContract(
      org,
      userId,
    );
    try {
      let result = await contract.evaluateTransaction(
        'QueryAuction',
        auctionID,
      );
      gateway.disconnect();
      return { auction: JSON.parse(result.toString()) };
    } catch (error) {
      gateway.disconnect();
      throw error;
    }
  }
}
