import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { SellerService } from './seller.service';

@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Post('create-auction')
  async createAuction(@Body() body: { org: string; userId: string; auctionID: string; item: string; timelimit?: string; description: string; pictureUrl: string }) {
    return this.sellerService.createAuction(body.org, body.userId, body.auctionID, body.item, body.timelimit, body.description, body.pictureUrl);
  }

  @Get('auctions-by-seller')
  async getAllAuctionsBySeller(@Query('org') org: string, @Query('userId') userId: string) {
    return this.sellerService.getAllAuctionsBySeller(org, userId);
  }

  // @Post('end-auction')
  // async endAuction(@Body() body: { org: string; userId: string; auctionID: string }) {
  //   return this.sellerService.endAuction(body.org, body.userId, body.auctionID);
  // }

  // @Get('view-auction')
  // async viewAuction(@Query('org') org: string, @Query('userId') userId: string, @Query('auctionID') auctionID: string) {
  //   return this.sellerService.viewAuction(org, userId, auctionID);
  // }

}
