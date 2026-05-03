// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgenticID
 * @notice ERC-7857 Agentic Identity NFT with Encrypted Metadata
 */
contract AgenticID is ERC721, Ownable {
    struct AgenticMetadata {
        string encryptedMetaCID; // Pointer to 0G Storage encrypted blob
        bytes publicKey;         // Owner's encryption public key
        uint8 agentType;
        uint64 capabilityFlags;
    }

    struct ReEncryptionRequest {
        address previousOwner;
        address newOwner;
        bytes previousOwnerPubKey;
        bytes newOwnerPubKey;
        bool fulfilled;
    }

    mapping(uint256 => AgenticMetadata) public agentMeta;
    mapping(uint256 => ReEncryptionRequest) public reEncryptionRequests;
    mapping(address => bytes) public ownerPublicKeys;

    uint256 private _nextTokenId = 1;

    event AgenticIDMinted(uint256 indexed tokenId, address indexed owner, string encryptedMetaCID);
    event ReEncryptionRequested(uint256 indexed tokenId, address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) ERC721("Agentic Identity", "AGID") Ownable(initialOwner) {}

    function mint(
        string calldata encryptedMetaCID,
        bytes calldata ownerPubKey,
        uint8 agentType,
        uint64 capabilityFlags
    ) external returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        
        agentMeta[tokenId] = AgenticMetadata({
            encryptedMetaCID: encryptedMetaCID,
            publicKey: ownerPubKey,
            agentType: agentType,
            capabilityFlags: capabilityFlags
        });

        ownerPublicKeys[msg.sender] = ownerPubKey;
        _safeMint(msg.sender, tokenId);

        emit AgenticIDMinted(tokenId, msg.sender, encryptedMetaCID);
    }

    function registerPublicKey(bytes calldata pubKey) external {
        ownerPublicKeys[msg.sender] = pubKey;
    }

    // ERC-7857 proxy re-encryption on transfer
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);

        if (from != address(0) && to != address(0)) {
            reEncryptionRequests[tokenId] = ReEncryptionRequest({
                previousOwner: from,
                newOwner: to,
                previousOwnerPubKey: ownerPublicKeys[from],
                newOwnerPubKey: ownerPublicKeys[to],
                fulfilled: false
            });
            emit ReEncryptionRequested(tokenId, from, to);
        }

        return super._update(to, tokenId, auth);
    }
}
