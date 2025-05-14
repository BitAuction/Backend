import { Injectable } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';

@Injectable()
export class BiddingService {
  constructor(private readonly fabricService: FabricService) {}

  async bid(org: string, userId: string, auctionID: string, price: number) {
    const { contract, gateway } = await this.fabricService.getContract(
      org,
      userId,
    );
    const { contract: timerorcleContract, gateway: timerorcleGateway } =
      await this.fabricService.getContract(
        org,
        userId,
        undefined,
        'timeoracle',
      );
    try {
      let auctionResult = await contract.evaluateTransaction(
        'QueryAuction',
        auctionID,
      );
      let auction = JSON.parse(auctionResult.toString());

      const txID = await contract.submitTransaction(
        'Bid',
        auctionID,
        price.toString(),
      );

      const timeResponse = await timerorcleContract.submitTransaction(
        'GetTimeNtp',
        txID.toString(),
      );

      // Create a transaction for SubmitBid
      const submitBidTx = contract.createTransaction('SubmitBid');
      // Set all organizations as endorsers
      submitBidTx.setEndorsingOrganizations(...auction.organizations);

      // Submit the bid with all organizations as endorsers
      await submitBidTx.submit(auctionID, txID.toString());

      // Fetch updated auction to get all bids
      let result = await contract.evaluateTransaction(
        'QueryAuction',
        auctionID,
      );

      let auctionAfterSubmittingBid = JSON.parse(result.toString());
      gateway.disconnect();
      // console.log('Auction After submitting: ', auctionAfterSubmittingBid.bids);
      return { bids: auctionAfterSubmittingBid.bids };
    } catch (error) {
      gateway.disconnect();
      throw error;
    }
  }

  async getAllBids(org: string, userId: string, auctionID: string) {
    const { contract, gateway } = await this.fabricService.getContract(
      org,
      userId,
    );
    try {
      let result = await contract.evaluateTransaction(
        'QueryAuction',
        auctionID,
      );
      let auction = JSON.parse(result.toString());
      gateway.disconnect();
      return { bids: auction.bids };
    } catch (error) {
      gateway.disconnect();
      throw error;
    }
  }

  async getHighestBid(org: string, userId: string, auctionID: string) {
    const { contract, gateway } = await this.fabricService.getContract(
      org,
      userId,
    );
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
