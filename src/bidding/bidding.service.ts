import { Injectable } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';
import { Auction, Bid } from 'src/auction/auction.service';

@Injectable()
export class BiddingService {
  constructor(private readonly fabricService: FabricService) {}

  async bid(org: string, userId: string, auctionID: string, price: number) {
    const { contract, gateway } = await this.fabricService.getContract(
      org,
      userId,
    );
    // const { contract: timerorcleContract, gateway: timerorcleGateway } =
    //   await this.fabricService.getContract(
    //     org,
    //     userId,
    //     undefined,
    //     'timeoracle',
    //   );
    try {
      const auctionResult = await contract.evaluateTransaction(
        'QueryAuction',
        auctionID,
      );
      const auction = JSON.parse(auctionResult.toString()) as Auction;

      const txID = await contract.submitTransaction(
        'Bid',
        auctionID,
        price.toString(),
      );

      // const timeResponse = await timerorcleContract.submitTransaction(
      //   'GetTimeNtp',
      //   txID.toString(),
      // );

      // Create a transaction for SubmitBid
      const submitBidTx = contract.createTransaction('SubmitBid');
      // Set all organizations as endorsers
      submitBidTx.setEndorsingOrganizations(...auction.organizations);

      // Submit the bid with all organizations as endorsers
      await submitBidTx.submit(auctionID, txID.toString());

      // Fetch updated auction to get all bids
      const result = await contract.evaluateTransaction('QueryBids', auctionID);
      gateway.disconnect();

      const bidsAfterSubmittingBid = JSON.parse(result.toString()) as Bid[];
      // console.log('Bids After submitting: ', bidsAfterSubmittingBid);
      return { bids: bidsAfterSubmittingBid };
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
      const result = await contract.evaluateTransaction('QueryBids', auctionID);
      gateway.disconnect();

      // Handle empty or null response
      const resultString = result.toString().trim();
      if (!resultString) {
        return { bids: [] };
      }

      const auctionBids = JSON.parse(resultString) as Bid[];
      // console.log('Bids sent: ', auctionBids);
      return { bids: auctionBids };
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
      const result = await contract.evaluateTransaction('GetHb', auctionID);
      gateway.disconnect();
      return JSON.parse(result.toString());
    } catch (error) {
      gateway.disconnect();
      throw error;
    }
  }
}
