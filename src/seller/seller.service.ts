import { Injectable } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';

@Injectable()
export class SellerService {

  constructor(private readonly fabricService: FabricService) {}

  async createAuction(org: string, userId: string, auctionID: string, item: string, timelimit?: string, description?: string, pictureUrl?: string) {
    const { contract, gateway } = await this.fabricService.getContract(org, userId);
    let statefulTxn = contract.createTransaction('CreateAuction');
    if (!timelimit) {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      timelimit = tomorrow.toISOString();
    }
    await statefulTxn.submit(auctionID, item, timelimit, description || '', pictureUrl || '');
    let result = await contract.evaluateTransaction('QueryAuction', auctionID);
    gateway.disconnect();
    return { auction: JSON.parse(result.toString()) };
  }

  async getAllAuctionsBySeller(org: string, userId: string) {
    const { contract, gateway } = await this.fabricService.getContract(org, userId);
    try {
      let result = await contract.evaluateTransaction('GetAllAuctionsBySeller', userId);
      gateway.disconnect();
      return { auctions: JSON.parse(result.toString()) };
    } catch (error) {
      gateway.disconnect();
      throw error;
    }
  }

  // async endAuction(org: string, userId: string, auctionID: string) {
  //   const { contract, gateway } = await this.fabricService.getContract(org, userId);
  //   let auctionString = await contract.evaluateTransaction('QueryAuction', auctionID);
  //   let auctionJSON = JSON.parse(auctionString.toString());
  //   let statefulTxn = contract.createTransaction('EndAuction');
  //   statefulTxn.setEndorsingOrganizations(...auctionJSON.organizations);
  //   await statefulTxn.submit(auctionID);
  //   let result = await contract.evaluateTransaction('QueryAuction', auctionID);
  //   gateway.disconnect();
  //   return { auction: JSON.parse(result.toString()) };
  // }

  // async viewAuction(org: string, userId: string, auctionID: string) {
  //   const { contract, gateway } = await this.fabricService.getContract(org, userId);
  //   let result = await contract.evaluateTransaction('QueryAuction', auctionID);
  //   gateway.disconnect();
  //   return { auction: JSON.parse(result.toString()) };
  // }
}
