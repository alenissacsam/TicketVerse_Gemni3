// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract TicketNFT is ERC1155, ERC2981, AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ORGANIZER_ROLE = keccak256("ORGANIZER");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER");
    
    struct EventRules {
        uint256 maxPerWallet;
        uint256 maxResalePrice; // basis points (11000 = 110%)
        uint256 transferUnlockTime;
        bool transferable;
    }
    
    mapping(uint256 => EventRules) public eventRules;
    mapping(address => mapping(uint256 => uint256)) public ticketsClaimed;
    mapping(uint256 => bool) public redeemed; // tokenId => redeemed
    
    event TicketMinted(address indexed to, uint256 indexed tokenId, uint256 eventId);
    event TicketRedeemed(uint256 indexed tokenId, address indexed redeemedBy);
    
    constructor(string memory uri) ERC1155(uri) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        uint256 eventId
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        EventRules memory rules = eventRules[eventId];
        
        // Enforce max per wallet
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(
            ticketsClaimed[to][eventId] + totalAmount <= rules.maxPerWallet,
            "Exceeds max per wallet"
        );
        
        ticketsClaimed[to][eventId] += totalAmount;
        _mintBatch(to, ids, amounts, "");
        
        emit TicketMinted(to, ids[0], eventId);
    }
    
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override nonReentrant whenNotPaused {
        uint256 eventId = id / 1000000; // Derive eventId from tokenId (simple convention)
        EventRules memory rules = eventRules[eventId];
        
        require(rules.transferable, "Ticket not transferable");
        require(block.timestamp >= rules.transferUnlockTime, "Transfer locked");
        require(!redeemed[id], "Ticket already redeemed");
        
        super.safeTransferFrom(from, to, id, amount, data);
    }
    
    function redeemTicket(uint256 tokenId) external onlyRole(ORGANIZER_ROLE) {
        require(!redeemed[tokenId], "Already redeemed");
        redeemed[tokenId] = true;
        emit TicketRedeemed(tokenId, msg.sender);
    }
    
    function setEventRules(
        uint256 eventId,
        uint256 maxPerWallet,
        uint256 maxResalePrice,
        uint256 transferUnlockTime,
        bool transferable
    ) external onlyRole(ORGANIZER_ROLE) {
        eventRules[eventId] = EventRules({
            maxPerWallet: maxPerWallet,
            maxResalePrice: maxResalePrice,
            transferUnlockTime: transferUnlockTime,
            transferable: transferable
        });
    }
    
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _setDefaultRoyalty(receiver, feeNumerator);
    }
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, ERC2981, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
