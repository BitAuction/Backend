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
      let result = await contract.evaluateTransaction('GetAllAuctionsBySeller', userId);
      gateway.disconnect();
      return { auctions: JSON.parse(result.toString()) };
    } catch (error) {
      gateway.disconnect();
      throw error;
    }
  }
} 