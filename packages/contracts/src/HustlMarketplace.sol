// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title HustlMarketplace
 * @notice On-chain registry for Hustl3 gig listings.
 *         Stores tamper-proof metadata hashes pointing to 0G Storage.
 *         Deployed on 0G Chain (primary) and Base.
 */
contract HustlMarketplace is Ownable, Pausable {
    struct Gig {
        string  gigId;
        address seller;
        bytes32 ensNameHash;
        bytes32 metadataHash;   // points to 0G Storage document
        uint256 price;          // in token smallest unit
        address paymentToken;   // address(0) = native ETH
        uint64  createdAt;
        bool    active;
    }

    mapping(string => Gig)    public gigs;
    mapping(string => bool)   public gigExists;
    mapping(address => string[]) private sellerGigs;

    event GigListed(
        string indexed gigId,
        address indexed seller,
        bytes32 ensNameHash,
        bytes32 metadataHash,
        uint256 price,
        address paymentToken
    );
    event GigUpdated(
        string indexed gigId,
        bytes32 newMetadataHash
    );
    event GigDeactivated(
        string indexed gigId,
        address indexed seller
    );

    error Marketplace__GigNotFound();
    error Marketplace__GigAlreadyExists();
    error Marketplace__Unauthorized();
    error Marketplace__InvalidInput();

    constructor(address initialOwner) Ownable(initialOwner) {}

    modifier onlyGigOwner(string calldata gigId) {
        if (!gigExists[gigId]) revert Marketplace__GigNotFound();
        if (gigs[gigId].seller != msg.sender && owner() != msg.sender) {
            revert Marketplace__Unauthorized();
        }
        _;
    }

    /**
     * @notice List a new gig. Seller must call this after storing metadata in 0G Storage.
     */
    function listGig(
        string   calldata gigId,
        bytes32  ensNameHash,
        bytes32  metadataHash,
        uint256  price,
        address  paymentToken
    ) external whenNotPaused {
        if (gigExists[gigId]) revert Marketplace__GigAlreadyExists();
        if (metadataHash == bytes32(0)) revert Marketplace__InvalidInput();

        gigs[gigId] = Gig({
            gigId:        gigId,
            seller:       msg.sender,
            ensNameHash:  ensNameHash,
            metadataHash: metadataHash,
            price:        price,
            paymentToken: paymentToken,
            createdAt:    uint64(block.timestamp),
            active:       true
        });
        gigExists[gigId] = true;
        sellerGigs[msg.sender].push(gigId);

        emit GigListed(gigId, msg.sender, ensNameHash, metadataHash, price, paymentToken);
    }

    /**
     * @notice Update gig metadata hash — called when agent updates gig content in 0G Storage.
     */
    function updateMetadataHash(
        string  calldata gigId,
        bytes32 newMetadataHash
    ) external onlyGigOwner(gigId) whenNotPaused {
        if (newMetadataHash == bytes32(0)) revert Marketplace__InvalidInput();
        gigs[gigId].metadataHash = newMetadataHash;
        emit GigUpdated(gigId, newMetadataHash);
    }

    /**
     * @notice Deactivate a gig listing.
     */
    function deactivateGig(string calldata gigId) external onlyGigOwner(gigId) {
        gigs[gigId].active = false;
        emit GigDeactivated(gigId, gigs[gigId].seller);
    }

    /**
     * @notice Verify a gig by comparing an off-chain computed hash against the stored hash.
     * @return valid True if the supplied hash matches on-chain record.
     */
    function verifyGig(
        string  calldata gigId,
        bytes32 expectedHash
    ) external view returns (bool valid) {
        if (!gigExists[gigId]) return false;
        return gigs[gigId].metadataHash == expectedHash;
    }

    /**
     * @notice Get all gig IDs for a seller.
     */
    function getSellerGigs(address seller) external view returns (string[] memory) {
        return sellerGigs[seller];
    }

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
