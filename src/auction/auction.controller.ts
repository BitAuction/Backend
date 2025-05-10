import { Controller, Get, Query } from '@nestjs/common';
import { AuctionService } from './auction.service';

@Controller('auctions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Get()
  async getAllAuctions(
    @Query('org') org: string,
    @Query('userId') userId: string,
  ) {
    return this.auctionService.getAllOpenAuctions(org, userId);
  }

  @Get('user')
  async getAllAuctionsByUser(
    @Query('org') org: string,
    @Query('userId') userId: string,
  ) {
    return this.auctionService.getAllAuctionsByUser(org, userId);
  }
}
