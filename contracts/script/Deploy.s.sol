// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/TicketNFT.sol";

contract DeployTicketNFT is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        TicketNFT ticketNFT = new TicketNFT("https://api.ticketverse.com/metadata/");
        
        console.log("TicketNFT deployed at:", address(ticketNFT));
        
        vm.stopBroadcast();
    }
}
