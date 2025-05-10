import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class FabricService {
  private Wallets: any;
  private CAUtil: any;
  private AppUtil: any;
  private FabricCAServices: any;
  private initialized = false;

  private orgs: any;

  private async init() {
    if (this.initialized) return;
    this.Wallets = (await import('fabric-network')).Wallets;
    this.CAUtil = await import('../../../../../test-application/javascript/CAUtil.js');
    this.AppUtil = await import('../../../../../test-application/javascript/AppUtil.js');
    this.FabricCAServices = require('fabric-ca-client');

    this.orgs = {
      Org1: {
        msp: 'Org1MSP',
        buildCCP: this.AppUtil.buildCCPOrg1,
        caName: 'ca.org1.example.com',
        walletPath: join(__dirname, '../../wallet/org1'),
        affiliation: 'org1.department1',
      },
      Org2: {
        msp: 'Org2MSP',
        buildCCP: this.AppUtil.buildCCPOrg2,
        caName: 'ca.org2.example.com',
        walletPath: join(__dirname, '../../wallet/org2'),
        affiliation: 'org2.department2',
      },
      Org3: {
        msp: 'Org3MSP',
        buildCCP: this.AppUtil.buildCCPOrg3,
        caName: 'ca.org3.example.com',
        walletPath: join(__dirname, '../../wallet/org3'),
        affiliation: 'org3.department3',
      },
      Org4: {
        msp: 'Org4MSP',
        buildCCP: this.AppUtil.buildCCPOrg4,
        caName: 'ca.org4.example.com',
        walletPath: join(__dirname, '../../wallet/org4'),
        affiliation: 'org4.department4',
      },
    };
    this.initialized = true;
  }

  async login(org: string, userId: string) {
    await this.init();
    // Org MSP and CA config
    const orgKey = Object.keys(this.orgs).find(
      (key) => key.toLowerCase() === org.toLowerCase()
    );
    if (!orgKey) {
      throw new Error('Invalid org. Must be Org1, Org2, Org3, or Org4');
    }
    const orgConfig = this.orgs[orgKey];

    // Build CCP, CA client, and wallet
    const ccp = orgConfig.buildCCP();
    const caClient = this.CAUtil.buildCAClient(
      this.FabricCAServices,
      ccp,
      orgConfig.caName
    );
    const wallet = await this.AppUtil.buildWallet(this.Wallets, orgConfig.walletPath);

    // Enroll admin if not already enrolled
    await this.CAUtil.enrollAdmin(
      caClient,
      wallet,
      orgConfig.msp
    );

    // Register and enroll user
    await this.CAUtil.registerAndEnrollUser(
      caClient,
      wallet,
      orgConfig.msp,
      userId,
      orgConfig.affiliation
    );
    return { message: `User ${userId} enrolled for ${orgKey}` };
  }

  async getContract(org: string, userId: string, channelName = 'mychannel', chaincodeName = 'auction') {
    await this.init();
    const { Gateway } = await import('fabric-network');
    // Org MSP and CA config
    const orgKey = Object.keys(this.orgs).find(
      (key) => key.toLowerCase() === org.toLowerCase()
    );
    if (!orgKey) throw new Error('Invalid org. Must be Org1, Org2, Org3, or Org4');
    const orgConfig = this.orgs[orgKey];
    const ccp = orgConfig.buildCCP();
    const wallet = await this.AppUtil.buildWallet(this.Wallets, orgConfig.walletPath);
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: userId, discovery: { enabled: true, asLocalhost: true } });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    return { contract, gateway };
  }
} 