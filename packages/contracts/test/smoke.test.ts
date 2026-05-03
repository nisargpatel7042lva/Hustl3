import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Smoke tests - basic deployment & flows', function () {
  it('deploys marketplace and escrow, lists a gig, and creates an escrow', async function () {
    const [deployer, buyer, seller] = await ethers.getSigners();

    // Deploy marketplace
    const Marketplace = await ethers.getContractFactory('HustlMarketplace');
    const marketplace = await Marketplace.deploy(deployer.address);
    await marketplace.waitForDeployment();

    // Seller lists a gig
    const gigId = 'smoke-gig-1';
    const ensHash = ethers.utils.formatBytes32String('seller');
    const metadataHash = ethers.utils.formatBytes32String('meta');
    const price = 100;

    await expect(
      marketplace.connect(seller).listGig(gigId, ensHash, metadataHash, price, ethers.constants.AddressZero)
    ).to.not.be.reverted;

    const storedGig = await marketplace.gigs(gigId);
    expect(storedGig.seller.toLowerCase()).to.equal(seller.address.toLowerCase());

    // Deploy escrow (deployer is owner & authorized backend)
    const Escrow = await ethers.getContractFactory('HustlEscrow');
    const escrow = await Escrow.deploy(deployer.address, deployer.address);
    await escrow.waitForDeployment();

    // Create escrow on-chain via backend-authorized call
    const orderId = 'smoke-order-1';
    const amount = ethers.parseEther('0.01');

    await expect(
      escrow.createEscrowForAgent(orderId, buyer.address, seller.address, ethers.constants.AddressZero, amount, 'keeper-job-1', { value: amount })
    ).to.not.be.reverted;

    const esc = await escrow.escrows(orderId);
    expect(esc.amount.toString()).to.equal(amount.toString());
    expect(esc.buyer.toLowerCase()).to.equal(buyer.address.toLowerCase());
    expect(esc.seller.toLowerCase()).to.equal(seller.address.toLowerCase());
  });
});
