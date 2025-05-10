import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { BiddingService } from './bidding.service';

@Controller('bidding')
export class BiddingController {
  constructor(private readonly biddingService: BiddingService) {}

  @Post('bid')
  async bid(@Body() body: { org: string; userId: string; auctionID: string; price: number }) {
    return this.biddingService.bid(body.org, body.userId, body.auctionID, body.price);
  }

  @Get('bids')
  async getAllBids(@Query('org') org: string, @Query('userId') userId: string, @Query('auctionID') auctionID: string) {
    return this.biddingService.getAllBids(org, userId, auctionID);
  }

  @Get('highest-bid')
  async getHighestBid(@Query('org') org: string, @Query('userId') userId: string, @Query('auctionID') auctionID: string) {
    return this.biddingService.getHighestBid(org, userId, auctionID);
  }
} 