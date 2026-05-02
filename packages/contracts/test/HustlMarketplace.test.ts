import { expect } from "chai";
import { ethers } from "hardhat";

describe("HustlMarketplace", function () {
  it("Should deploy and register a gig", async function () {
    const Marketplace = await ethers.getContractFactory("HustlMarketplace");
    const marketplace = await Marketplace.deploy();
    await marketplace.waitForDeployment();

    const [owner, seller] = await ethers.getSigners();
    
    // Register gig
    const tx = await marketplace.connect(seller).registerGig("0x0000000000000000000000000000000000000000000000000000000000000001", 1000, 1);
    const receipt = await tx.wait();
    
    expect(receipt).to.not.be.null;

    const gigInfo = await marketplace.getGigInfo(seller.address, 1);
    expect(gigInfo.active).to.be.true;
    expect(gigInfo.basePrice).to.equal(1000);
  });
});
