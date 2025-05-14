import { Injectable } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';

@Injectable()
export class BiddingService {

  constructor(private readonly fabricService: FabricService) {}

  async bid(org: string, userId: string, auctionID: string, price: number) {
    const { contract, gateway } = await this.fabricService.getContract(org, userId);
    // const orgMSP = this.fabricService.getOrgMSP(org);
    try {
      // Submit a public bid
      const txID = await contract.submitTransaction('Bid', auctionID, price.toString());
      await contract.submitTransaction('SubmitBid', auctionID, txID.toString());

      // Fetch updated auction to get all bids
      let result = await contract.evaluateTransaction('QueryAuction', auctionID);
      let auction = JSON.parse(result.toString());
      gateway.disconnect();
      return { bids: auction.bids };
    } catch (error) {
      gateway.disconnect();
      throw error;
    }
  }

  async getAllBids(org: string, userId: string, auctionID: string) {
    const { contract, gateway } = await this.fabricService.getContract(org, userId);
    try {
      let result = await contract.evaluateTransaction('QueryAuction', auctionID);
      let auction = JSON.parse(result.toString());
      gateway.disconnect();
      return { bids: auction.bids };
    } catch (error) {
      gateway.disconnect();
      throw error;
    }
  }

  async getHighestBid(org: string, userId: string, auctionID: string) {
    const { contract, gateway } = await this.fabricService.getContract(org, userId);
    try {
      let result = await contract.evaluateTransaction('GetHb', auctionID);
      gateway.disconnect();
      return JSON.parse(result.toString());
    } catch (error) {
      gateway.disconnect();
      throw error;
    }
  }
}
