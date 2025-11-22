// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/UserVerification.sol";
import "../src/TicketMarketplace.sol";
import "../src/EventTicket.sol";
import "../src/EventFactory.sol";

contract DeployHub is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address usdcToken = vm.envAddress("USDC_TOKEN_ADDRESS");
        address treasury = vm.envAddress("TREASURY_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy UserVerification
        UserVerification verification = new UserVerification();
        console.log("UserVerification deployed at:", address(verification));

        // 2. Deploy TicketMarketplace
        TicketMarketplace marketplace = new TicketMarketplace(usdcToken, treasury);
        console.log("TicketMarketplace deployed at:", address(marketplace));

        // 3. Deploy EventTicket Implementation (Master Copy)
        EventTicket implementation = new EventTicket();
        console.log("EventTicket Implementation deployed at:", address(implementation));

        // 4. Deploy EventFactory
        EventFactory factory = new EventFactory(
            address(implementation),
            address(verification),
            address(marketplace)
        );
        console.log("EventFactory deployed at:", address(factory));
        
        // 5. Whitelist Deployer (so you can create events immediately)
        factory.setOrganizerStatus(deployer, true);
        console.log("Deployer whitelisted as organizer");

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("NEXT_PUBLIC_USER_VERIFICATION_ADDRESS=", address(verification));
        console.log("NEXT_PUBLIC_TICKET_MARKETPLACE_ADDRESS=", address(marketplace));
        console.log("NEXT_PUBLIC_EVENT_FACTORY_ADDRESS=", address(factory));
    }
}
