// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITicketMarketplace {
    function deposit(uint256 amount) external;
    function processPrimarySale(address buyer, address organizer, uint256 amount) external;
    function processRefund(address buyer, address organizer, uint256 amount) external;
    function buyTicket(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 deadline,
        address seller,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
    function cancelListing(address nftContract, uint256 tokenId, uint256 price, uint256 deadline) external;
    function withdraw() external;
}
