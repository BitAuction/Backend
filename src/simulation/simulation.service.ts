import { Injectable } from '@nestjs/common';

export interface SimulatedAuction {
  auctionID: string;
  item: string;
  description: string;
  pictureUrl: string;
  timelimit: string;
  status: 'open' | 'ended';
  organizations: string[];
  bids: SimulatedBid[];
}

export interface SimulatedBid {
  price: number;
  bidder: string;
  org: string;
  Valid: boolean;
  Timestamp: string;
}

@Injectable()
export class SimulationService {
  private auctions: Map<string, SimulatedAuction> = new Map();
  private bidCounter = 0;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create some mock auctions
    const mockAuctions: SimulatedAuction[] = [
      {
        auctionID: 'auction-001',
        item: 'Vintage Rolex Watch',
        description: 'A beautiful vintage Rolex Submariner from 1965 in excellent condition.',
        pictureUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400',
        timelimit: '2024-12-31T23:59:59Z',
        status: 'open',
        organizations: ['org1', 'org2', 'org3', 'org4'],
        bids: [
          {
            price: 8500,
            bidder: 'user1',
            org: 'org1',
            Valid: true,
            Timestamp: new Date(Date.now() - 300000).toISOString(),
          },
          {
            price: 8200,
            bidder: 'user2',
            org: 'org2',
            Valid: true,
            Timestamp: new Date(Date.now() - 600000).toISOString(),
          },
        ],
      },
      {
        auctionID: 'auction-002',
        item: 'Antique Persian Rug',
        description: 'Hand-woven Persian rug from the 19th century with intricate patterns.',
        pictureUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
        timelimit: '2024-12-31T23:59:59Z',
        status: 'open',
        organizations: ['org1', 'org2', 'org3', 'org4'],
        bids: [
          {
            price: 3200,
            bidder: 'user3',
            org: 'org3',
            Valid: true,
            Timestamp: new Date(Date.now() - 180000).toISOString(),
          },
        ],
      },
    ];

    mockAuctions.forEach(auction => {
      this.auctions.set(auction.auctionID, auction);
    });
  }

  async getAllOpenAuctions(): Promise<SimulatedAuction[]> {
    return Array.from(this.auctions.values()).filter(auction => auction.status === 'open');
  }

  async getAuctionDetails(auctionID: string): Promise<SimulatedAuction | null> {
    return this.auctions.get(auctionID) || null;
  }

  async getHighestBid(auctionID: string): Promise<SimulatedBid | null> {
    const auction = this.auctions.get(auctionID);
    if (!auction || auction.bids.length === 0) {
      return null;
    }
    
    // Sort bids by price (highest first) and return the highest valid bid
    const validBids = auction.bids.filter(bid => bid.Valid);
    if (validBids.length === 0) return null;
    
    return validBids.sort((a, b) => b.price - a.price)[0];
  }

  async getAllBids(auctionID: string): Promise<SimulatedBid[]> {
    const auction = this.auctions.get(auctionID);
    return auction ? auction.bids : [];
  }

  async submitBid(auctionID: string, bidder: string, org: string, price: number): Promise<SimulatedBid> {
    const auction = this.auctions.get(auctionID);
    if (!auction) {
      throw new Error('Auction not found');
    }

    if (auction.status === 'ended') {
      throw new Error('Auction has ended');
    }

    const newBid: SimulatedBid = {
      price,
      bidder,
      org,
      Valid: true,
      Timestamp: new Date().toISOString(),
    };

    auction.bids.push(newBid);
    this.auctions.set(auctionID, auction);

    return newBid;
  }

  // Method to simulate random bid updates for testing
  async simulateRandomBid(auctionID: string): Promise<SimulatedBid | null> {
    const auction = this.auctions.get(auctionID);
    if (!auction || auction.status === 'ended') {
      return null;
    }

    const currentHighestBid = await this.getHighestBid(auctionID);
    const currentPrice = currentHighestBid?.price || 1000;
    
    // Generate a random bid 5-15% higher than current
    const increasePercentage = 0.05 + Math.random() * 0.1;
    const newPrice = Math.floor(currentPrice * (1 + increasePercentage));
    
    const bidders = ['user1', 'user2', 'user3', 'user4', 'user5'];
    const orgs = ['org1', 'org2', 'org3', 'org4'];
    
    const randomBidder = bidders[Math.floor(Math.random() * bidders.length)];
    const randomOrg = orgs[Math.floor(Math.random() * orgs.length)];

    return await this.submitBid(auctionID, randomBidder, randomOrg, newPrice);
  }
} 