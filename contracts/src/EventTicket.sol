// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721Upgradeable} from "@openzeppelin-upgradeable/contracts/token/ERC721/ERC721Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin-upgradeable/contracts/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin-upgradeable/contracts/proxy/utils/Initializable.sol";
import {IUserVerification} from "./interfaces/IUserVerification.sol";
import {ITicketMarketplace} from "./interfaces/ITicketMarketplace.sol";
import {IEventTicket} from "./interfaces/IEventTicket.sol";

interface IERC4907 {
    event UpdateUser(
        uint256 indexed tokenId,
        address indexed user,
        uint64 expires
    );
    function setUser(uint256 tokenId, address user, uint64 expires) external;
    function userOf(uint256 tokenId) external view returns (address);
    function userExpires(uint256 tokenId) external view returns (uint256);
}

/**
 * @title EventTicket
 * @notice ERC721 Ticket contract with Multi-Tier support, Rentals, and Dynamic Refunds.
 */
contract EventTicket is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    IERC4907,
    IEventTicket
{
    IUserVerification public userVerification;
    ITicketMarketplace public marketplace;

    uint256 public eventId;
    uint256 public totalSupply;
    uint256 public eventDate; // Timestamp of the event

    // Multi-Tier Storage
    mapping(uint256 => TicketTier) public tiers;
    uint256 public tierCount;
    mapping(uint256 => uint256) public tokenTier; // TokenID -> TierID

    // Mapping from TokenID to Seat Number
    mapping(uint256 => string) public seatNumbers;

    // Mapping for check-in status (Soulbound logic)
    mapping(uint256 => bool) public isCheckedIn;

    // ERC4907 Storage
    struct UserInfo {
        address user; // address of user role
        uint64 expires; // unix timestamp, user expires
    }
    mapping(uint256 => UserInfo) internal _users;

    event TicketMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 indexed tierId,
        string seatNumber
    );
    event CheckedIn(uint256 indexed tokenId);
    event TicketRefunded(
        uint256 indexed tokenId,
        address indexed user,
        uint256 refundAmount
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 _eventId,
        uint256 _eventDate,
        address _organizer,
        address _verification,
        address _marketplace,
        TicketTier[] memory _tiers
    ) public initializer {
        __ERC721_init(_name, _symbol);
        __Ownable_init(_organizer);

        eventId = _eventId;
        eventDate = _eventDate;
        userVerification = IUserVerification(_verification);
        marketplace = ITicketMarketplace(_marketplace);

        for (uint256 i = 0; i < _tiers.length; i++) {
            tiers[i] = _tiers[i];
        }
        tierCount = _tiers.length;
    }

    /**
     * @notice Mint a ticket for a specific tier.
     */
    function mint(uint256 tierId, string memory seatNumber) external {
        require(tierId < tierCount, "Invalid tier");
        TicketTier storage tier = tiers[tierId];
        
        require(tier.minted < tier.supply, "Tier sold out");
        require(userVerification.isVerified(msg.sender), "User not verified");

        // Process Payment (Pull from buyer to Marketplace)
        marketplace.processPrimarySale(msg.sender, owner(), tier.price);

        uint256 tokenId = totalSupply + 1;
        totalSupply++;
        tier.minted++;
        tokenTier[tokenId] = tierId;

        seatNumbers[tokenId] = seatNumber;
        _safeMint(msg.sender, tokenId);

        emit TicketMinted(msg.sender, tokenId, tierId, seatNumber);
    }

    /**
     * @notice Refund a ticket with dynamic pricing.
     * @dev 100% refund if >50% time remains, decreasing as event approaches.
     */
    function refundTicket(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not ticket owner");
        require(block.timestamp < eventDate, "Event already started");
        require(!isCheckedIn[tokenId], "Already checked in");

        uint256 refundAmount = calculateRefundAmount(tokenId);

        // Burn ticket
        _burn(tokenId);
        delete seatNumbers[tokenId];
        
        // Decrement tier minted count? 
        // Ideally yes, but we might not want to resell the same seat/ticket easily without logic.
        // For simplicity, we won't decrement minted count to preserve "sold out" status if supply was strict.
        // Or we SHOULD decrement to allow resale. Let's decrement.
        uint256 tierId = tokenTier[tokenId];
        if (tiers[tierId].minted > 0) {
            tiers[tierId].minted--;
        }
        delete tokenTier[tokenId];

        // Request refund from Marketplace (Marketplace needs to support this)
        marketplace.processRefund(msg.sender, owner(), refundAmount);

        emit TicketRefunded(tokenId, msg.sender, refundAmount);
    }

    /**
     * @notice Calculate refund amount based on time remaining.
     */
    function calculateRefundAmount(uint256 tokenId) public view returns (uint256) {
        uint256 timeRemaining = eventDate - block.timestamp;
        uint256 price = tiers[tokenTier[tokenId]].price;
        
        if (timeRemaining >= 30 days) return price;
        if (timeRemaining > 7 days) return (price * 75) / 100;
        if (timeRemaining > 1 days) return (price * 50) / 100;
        return 0;
    }

    function getTier(uint256 tierId) external view returns (TicketTier memory) {
        return tiers[tierId];
    }

    /**
     * @notice Check-in a user (Makes ticket Soulbound).
     */
    function checkIn(uint256 tokenId) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "Invalid token");
        isCheckedIn[tokenId] = true;
        emit CheckedIn(tokenId);
    }

    /**
     * @notice Return metadata URI for the token's tier.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return tiers[tokenTier[tokenId]].metadataUri;
    }

    // --- ERC4907 Rental Logic ---

    function setUser(
        uint256 tokenId,
        address user,
        uint64 expires
    ) public virtual override {
        require(
            _isApprovedOrOwner(msg.sender, tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        UserInfo storage info = _users[tokenId];
        info.user = user;
        info.expires = expires;
        emit UpdateUser(tokenId, user, expires);
    }

    function userOf(
        uint256 tokenId
    ) public view virtual override returns (address) {
        if (uint256(_users[tokenId].expires) >= block.timestamp) {
            return _users[tokenId].user;
        }
        return address(0);
    }

    function userExpires(
        uint256 tokenId
    ) public view virtual override returns (uint256) {
        return _users[tokenId].expires;
    }

    // --- Overrides ---

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721Upgradeable) {
        require(!isCheckedIn[tokenId], "Ticket already checked in (Soulbound)");
        super.transferFrom(from, to, tokenId);

        // Clear rental on transfer
        if (_users[tokenId].user != address(0)) {
            delete _users[tokenId];
            emit UpdateUser(tokenId, address(0), 0);
        }
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override(ERC721Upgradeable) {
        require(!isCheckedIn[tokenId], "Ticket already checked in (Soulbound)");
        super.safeTransferFrom(from, to, tokenId, data);

        // Clear rental on transfer
        if (_users[tokenId].user != address(0)) {
            delete _users[tokenId];
            emit UpdateUser(tokenId, address(0), 0);
        }
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721Upgradeable) returns (bool) {
        return
            interfaceId == type(IERC4907).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _isApprovedOrOwner(
        address spender,
        uint256 tokenId
    ) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner ||
            getApproved(tokenId) == spender ||
            isApprovedForAll(owner, spender));
    }
}
