import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";

describe("Hustl3Escrow", function () {
  let escrow: any;
  let owner: Signer;
  let buyer: Signer;
  let seller: Signer;
  let authorizedContract: Signer;

  const ORDER_ID = "order_001";
  const TOKEN_AMOUNT = ethers.parseEther("1.0");

  beforeEach(async function () {
    [owner, buyer, seller, authorizedContract] = await ethers.getSigners();

    const Escrow = await ethers.getContractFactory("Hustl3Escrow");
    escrow = await Escrow.deploy();
    await escrow.waitForDeployment();
  });

  describe("createOrder", function () {
    it("should create an order successfully", async function () {
      const tx = await escrow.connect(buyer).createOrder(
        ORDER_ID,
        seller.address,
        ethers.ZeroAddress,
        TOKEN_AMOUNT,
        { value: TOKEN_AMOUNT }
      );

      await expect(tx).to.emit(escrow, "OrderCreated");

      const order = await escrow.orders(ORDER_ID);
      expect(order.seller).to.equal(seller.address);
      expect(order.buyer).to.equal(await buyer.getAddress());
      expect(order.amount).to.equal(TOKEN_AMOUNT);
    });

    it("should reject duplicate order IDs", async function () {
      await escrow.connect(buyer).createOrder(ORDER_ID, seller.address, ethers.ZeroAddress, TOKEN_AMOUNT, { value: TOKEN_AMOUNT });

      await expect(
        escrow.connect(buyer).createOrder(ORDER_ID, seller.address, ethers.ZeroAddress, TOKEN_AMOUNT, { value: TOKEN_AMOUNT })
      ).to.be.revertedWithCustomError(escrow, "Escrow__OrderAlreadyExists");
    });

    it("should reject self-ordering", async function () {
      await expect(
        escrow.connect(buyer).createOrder(ORDER_ID, await buyer.getAddress(), ethers.ZeroAddress, TOKEN_AMOUNT, { value: TOKEN_AMOUNT })
      ).to.be.revertedWithCustomError(escrow, "Escrow__SelfTransaction");
    });

    it("should reject zero address seller", async function () {
      await expect(
        escrow.connect(buyer).createOrder(ORDER_ID, ethers.ZeroAddress, ethers.ZeroAddress, TOKEN_AMOUNT, { value: TOKEN_AMOUNT })
      ).to.be.revertedWithCustomError(escrow, "Escrow__InvalidStatus");
    });

    it("should reject zero amount", async function () {
      await expect(
        escrow.connect(buyer).createOrder(ORDER_ID, seller.address, ethers.ZeroAddress, 0, { value: 0 })
      ).to.be.revertedWithCustomError(escrow, "Escrow__InvalidStatus");
    });
  });

  // ... (tests copied)
});
