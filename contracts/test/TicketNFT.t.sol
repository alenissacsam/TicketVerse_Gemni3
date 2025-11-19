// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TicketNFT.sol";

contract TicketNFTTest is Test {
    TicketNFT public ticketNFT;
    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);

    function setUp() public {
        vm.startPrank(owner);
        ticketNFT = new TicketNFT("https://api.ticketverse.com/metadata/");
        ticketNFT.grantRole(ticketNFT.ORGANIZER_ROLE(), owner);
        vm.stopPrank();
    }

    function testMintBatch() public {
        vm.startPrank(owner);
        
        // Set rules for event 1
        ticketNFT.setEventRules(1, 5, 11000, block.timestamp, true);
        
        uint256[] memory ids = new uint256[](1);
        ids[0] = 1000001; // Event 1, Ticket 1
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1;
        
        ticketNFT.mintBatch(user1, ids, amounts, 1);
        
        assertEq(ticketNFT.balanceOf(user1, 1000001), 1);
        vm.stopPrank();
    }

    function testMaxPerWallet() public {
        vm.startPrank(owner);
        ticketNFT.setEventRules(1, 2, 11000, block.timestamp, true);
        
        uint256[] memory ids = new uint256[](1);
        ids[0] = 1000001;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 3; // Try to mint 3, limit is 2
        
        vm.expectRevert("Exceeds max per wallet");
        ticketNFT.mintBatch(user1, ids, amounts, 1);
        vm.stopPrank();
    }
}
