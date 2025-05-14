import { Injectable } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';

@Injectable()
export class AuctionService {
  constructor(private readonly fabricService: FabricService) {}

  async getAllOpenAuctions(org: string, userId: string) {
    const { contract, gateway } = await this.fabricService.getContract(org, userId);
    try {
      let result = await contract.evaluateTransaction('GetAllOpenAuctions');
      gateway.disconnect();
      return { auctions: JSON.parse(result.toString()) };
    } catch (error) {
      gateway.disconnect();
      throw error;
    }
  }

  async getAllAuctionsByUser(org: string, userId: string) {
    const { contract, gateway } = await this.fabricService.getContract(org, userId);
    try {
      // For this function to work we need to pass full identity string from NestJS
      // const sellerId = `x509::CN=${userId},OU=client::CN=ca.org4.example.com,O=org4.example.com,L=Durham,ST=North Carolina,C=US`;
      let result = await contract.evaluateTransaction('GetAllAuctionsBySeller', userId);
      gateway.disconnect();
      return { auctions: JSON.parse(result.toString()) };
    } catch (error) {
      gateway.disconnect();
      throw error;
    }
  }

  async getAuctionDetails(org: string, userId: string, auctionID: string) {
    const { contract, gateway } = await this.fabricService.getContract(org, userId);
    try {
      let result = await contract.evaluateTransaction('QueryAuction', auctionID);
      gateway.disconnect();
      return { auction: JSON.parse(result.toString()) };
    } catch (error) {
      gateway.disconnect();
      throw error;
    }
  }
} 