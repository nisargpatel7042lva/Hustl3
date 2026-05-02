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

  describe("createOrderForAI", function () {
    const aiOrderId = "ai_order_001";

    it("should allow authorized contract to create order", async function () {
      await escrow.connect(owner).setAuthorizedContract(await authorizedContract.getAddress(), true);

      const tx = await escrow
        .connect(authorizedContract)
        .createOrderForAI(aiOrderId, await buyer.getAddress(), seller.address, ethers.ZeroAddress, TOKEN_AMOUNT, { value: TOKEN_AMOUNT });

      await expect(tx).to.emit(escrow, "OrderCreated");
    });

    it("should reject unauthorized caller", async function () {
      await expect(
        escrow.connect(seller).createOrderForAI(aiOrderId, await buyer.getAddress(), seller.address, ethers.ZeroAddress, TOKEN_AMOUNT, { value: TOKEN_AMOUNT })
      ).to.be.revertedWithCustomError(escrow, "Escrow__Unauthorized");
    });
  });

  describe("markDelivered", function () {
    beforeEach(async function () {
      await escrow.connect(buyer).createOrder(ORDER_ID, seller.address, ethers.ZeroAddress, TOKEN_AMOUNT, { value: TOKEN_AMOUNT });
    });

    it("should allow seller to mark as delivered", async function () {
      const tx = await escrow.connect(seller).markDelivered(ORDER_ID);
      await expect(tx).to.emit(escrow, "OrderDelivered");

      const order = await escrow.orders(ORDER_ID);
      expect(order.status).to.equal(1);
    });

    it("should reject non-seller", async function () {
      await expect(
        escrow.connect(buyer).markDelivered(ORDER_ID)
      ).to.be.revertedWithCustomError(escrow, "Escrow__Unauthorized");
    });

    it("should reject non-existent order", async function () {
      await expect(
        escrow.connect(seller).markDelivered("non_existent")
      ).to.be.revertedWithCustomError(escrow, "Escrow__OrderNotFound");
    });
  });

  describe("approveRelease", function () {
    beforeEach(async function () {
      await escrow.connect(buyer).createOrder(ORDER_ID, seller.address, ethers.ZeroAddress, TOKEN_AMOUNT, { value: TOKEN_AMOUNT });
      await escrow.connect(seller).markDelivered(ORDER_ID);
    });

    it("should release funds to seller when buyer approves", async function () {
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

      await escrow.connect(buyer).approveRelease(ORDER_ID);

      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      expect(sellerBalanceAfter).to.be.gt(sellerBalanceBefore);

      const order = await escrow.orders(ORDER_ID);
      expect(order.status).to.equal(2);
    });

    it("should reject non-buyer", async function () {
      await expect(
        escrow.connect(seller).approveRelease(ORDER_ID)
      ).to.be.revertedWithCustomError(escrow, "Escrow__Unauthorized");
    });
  });

  describe("autoReleaseAfterDeadline", function () {
    beforeEach(async function () {
      await escrow.connect(buyer).createOrder(ORDER_ID, seller.address, ethers.ZeroAddress, TOKEN_AMOUNT, { value: TOKEN_AMOUNT });
      await escrow.connect(seller).markDelivered(ORDER_ID);
    });

    it("should reject before deadline", async function () {
      await expect(
        escrow.autoReleaseAfterDeadline(ORDER_ID)
      ).to.be.revertedWithCustomError(escrow, "Escrow__DeadlineNotPassed");
    });

    it("should release after deadline passes", async function () {
      const AUTO_RELEASE_DELAY = 3 * 24 * 60 * 60;
      await ethers.provider.send("evm_increaseTime", [AUTO_RELEASE_DELAY + 1]);
      await ethers.provider.send("evm_mine", []);

      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

      await escrow.autoReleaseAfterDeadline(ORDER_ID);

      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      expect(sellerBalanceAfter).to.be.gt(sellerBalanceBefore);

      const order = await escrow.orders(ORDER_ID);
      expect(order.status).to.equal(4);
    });
  });

  describe("refundBuyer", function () {
    beforeEach(async function () {
      await escrow.connect(buyer).createOrder(ORDER_ID, seller.address, ethers.ZeroAddress, TOKEN_AMOUNT, { value: TOKEN_AMOUNT });
    });

    it("should allow buyer to refund before deadline", async function () {
      const buyerBalanceBefore = await ethers.provider.getBalance(await buyer.getAddress());

      await escrow.connect(buyer).refundBuyer(ORDER_ID);

      const buyerBalanceAfter = await ethers.provider.getBalance(await buyer.getAddress());
      expect(buyerBalanceAfter).to.be.gt(buyerBalanceBefore);

      const order = await escrow.orders(ORDER_ID);
      expect(order.status).to.equal(5);
    });

    it("should reject after deadline", async function () {
      const DISPUTE_WINDOW = 7 * 24 * 60 * 60;
      await ethers.provider.send("evm_increaseTime", [DISPUTE_WINDOW + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        escrow.connect(buyer).refundBuyer(ORDER_ID)
      ).to.be.revertedWithCustomError(escrow, "Escrow__InvalidStatus");
    });

    it("should reject non-buyer", async function () {
      await expect(
        escrow.connect(seller).refundBuyer(ORDER_ID)
      ).to.be.revertedWithCustomError(escrow, "Escrow__Unauthorized");
    });
  });

  describe("raiseDispute", function () {
    beforeEach(async function () {
      await escrow.connect(buyer).createOrder(ORDER_ID, seller.address, ethers.ZeroAddress, TOKEN_AMOUNT, { value: TOKEN_AMOUNT });
      await escrow.connect(seller).markDelivered(ORDER_ID);
    });

    it("should allow buyer to raise dispute", async function () {
      const tx = await escrow.connect(buyer).raiseDispute(ORDER_ID, "Product not as described");
      await expect(tx).to.emit(escrow, "DisputeRaised");

      const order = await escrow.orders(ORDER_ID);
      expect(order.status).to.equal(3);
      expect(order.disputeReason).to.equal("Product not as described");
    });

    it("should allow seller to raise dispute", async function () {
      await escrow.connect(seller).raiseDispute(ORDER_ID, "Buyer refused delivery");
      const order = await escrow.orders(ORDER_ID);
      expect(order.status).to.equal(3);
    });

    it("should reject non-participant", async function () {
      await expect(
        escrow.connect(authorizedContract).raiseDispute(ORDER_ID, "Invalid dispute")
      ).to.be.revertedWithCustomError(escrow, "Escrow__Unauthorized");
    });
  });

  describe("resolveDispute", function () {
    beforeEach(async function () {
      await escrow.connect(buyer).createOrder(ORDER_ID, seller.address, ethers.ZeroAddress, TOKEN_AMOUNT, { value: TOKEN_AMOUNT });
      await escrow.connect(seller).markDelivered(ORDER_ID);
      await escrow.connect(buyer).raiseDispute(ORDER_ID, "Quality issues");
    });

    it("should release funds to seller when resolved in favor of seller", async function () {
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

      await escrow.connect(owner).resolveDispute(ORDER_ID, true);

      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      expect(sellerBalanceAfter).to.be.gt(sellerBalanceBefore);

      const order = await escrow.orders(ORDER_ID);
      expect(order.status).to.equal(4);
    });

    it("should refund buyer when resolved in favor of buyer", async function () {
      const buyerBalanceBefore = await ethers.provider.getBalance(await buyer.getAddress());

      await escrow.connect(owner).resolveDispute(ORDER_ID, false);

      const buyerBalanceAfter = await ethers.provider.getBalance(await buyer.getAddress());
      expect(buyerBalanceAfter).to.be.gt(buyerBalanceBefore);

      const order = await escrow.orders(ORDER_ID);
      expect(order.status).to.equal(5);
    });
  });

  describe("pause/unpause", function () {
    it("should allow owner to pause and unpause", async function () {
      await escrow.connect(owner).pause();
      expect(await escrow.paused()).to.be.true;

      await escrow.connect(owner).unpause();
      expect(await escrow.paused()).to.be.false;
    });

    it("should reject order creation when paused", async function () {
      await escrow.connect(owner).pause();
      await expect(
        escrow.connect(buyer).createOrder(ORDER_ID, seller.address, ethers.ZeroAddress, TOKEN_AMOUNT, { value: TOKEN_AMOUNT })
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("access control", function () {
    it("should manage authorized contracts", async function () {
      await escrow.connect(owner).setAuthorizedContract(await authorizedContract.getAddress(), true);
      expect(await escrow.authorizedContracts(await authorizedContract.getAddress())).to.be.true;

      await escrow.connect(owner).setAuthorizedContract(await authorizedContract.getAddress(), false);
      expect(await escrow.authorizedContracts(await authorizedContract.getAddress())).to.be.false;
    });
  });
});