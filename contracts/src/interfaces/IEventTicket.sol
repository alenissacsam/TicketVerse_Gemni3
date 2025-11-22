// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEventTicket {
    struct TicketTier {
        string name;
        uint256 price;
        uint256 supply;
        uint256 minted;
        string metadataUri;
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
    ) external;

    function mint(uint256 tierId, string memory seatNumber) external;
    function refundTicket(uint256 tokenId) external;
    function checkIn(uint256 tokenId) external;
    function calculateRefundAmount(uint256 tokenId) external view returns (uint256);
    function getTier(uint256 tierId) external view returns (TicketTier memory);
}
