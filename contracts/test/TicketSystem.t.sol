// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/UserVerification.sol";
import "../src/TicketMarketplace.sol";
import "../src/EventTicket.sol";
import "../src/EventFactory.sol";
import "../src/interfaces/IEventTicket.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock USDC for testing
contract MockUSDC is ERC20 {
    constructor() ERC20("USDC", "USDC") {
        _mint(msg.sender, 1000000 * 10**6);
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}

contract TicketSystemTest is Test {
    UserVerification verification;
    TicketMarketplace marketplace;
    EventTicket implementation;
    EventFactory factory;
    MockUSDC usdc;

    address deployer = address(1);
    address organizer = address(2);
    address buyer = address(3);
    address treasury = address(4);

    function setUp() public {
        vm.startPrank(deployer);

        // Deploy Mock USDC
        usdc = new MockUSDC();

        // Deploy Core Contracts
        verification = new UserVerification();
        marketplace = new TicketMarketplace(address(usdc), treasury);
        implementation = new EventTicket();
        factory = new EventFactory(
            address(implementation),
            address(verification),
            address(marketplace)
        );
        
        // Whitelist organizer
        factory.setOrganizerStatus(organizer, true);

        vm.stopPrank();

        // Setup Users
        vm.startPrank(deployer);
        verification.addVerifier(deployer);
        verification.verifyUser(buyer, UserVerification.VerificationLevel.BASIC, 365 days);
        vm.stopPrank();

        // Fund Buyer
        usdc.mint(buyer, 10000 * 10**6);
        vm.startPrank(buyer);
        usdc.approve(address(marketplace), type(uint256).max);
        vm.stopPrank();
        
        // Fund Organizer (for creation fee and refunds)
        vm.deal(organizer, 10 ether);
        usdc.mint(organizer, 1000 * 10**6);
        vm.startPrank(organizer);
        usdc.approve(address(marketplace), type(uint256).max);
        vm.stopPrank();
    }

    function createDefaultTiers() internal pure returns (IEventTicket.TicketTier[] memory) {
        IEventTicket.TicketTier[] memory tiers = new IEventTicket.TicketTier[](2);
        tiers[0] = IEventTicket.TicketTier({
            name: "General Admission",
            price: 100 * 10**6,
            supply: 100,
            minted: 0,
            metadataUri: "ipfs://ga"
        });
        tiers[1] = IEventTicket.TicketTier({
            name: "VIP",
            price: 200 * 10**6,
            supply: 50,
            minted: 0,
            metadataUri: "ipfs://vip"
        });
        return tiers;
    }

    function testFullFlow() public {
        // 1. Organizer creates event
        vm.startPrank(organizer);
        IEventTicket.TicketTier[] memory tiers = createDefaultTiers();
        
        address eventAddress = factory.deployEvent{value: 0.01 ether}(
            "Test Event",
            "TEST",
            1, // eventId
            block.timestamp + 30 days, // Event Date
            tiers
        );
        EventTicket eventTicket = EventTicket(eventAddress);
        vm.stopPrank();

        assertEq(eventTicket.name(), "Test Event");
        assertEq(eventTicket.owner(), organizer);

        // 2. Buyer mints ticket (Tier 0 - GA)
        vm.startPrank(buyer);
        eventTicket.mint(0, "A1");
        vm.stopPrank();

        assertEq(eventTicket.ownerOf(1), buyer);
        assertEq(eventTicket.seatNumbers(1), "A1");
        
        // Check Tier Info
        (string memory name, uint256 price, uint256 supply, uint256 minted, string memory uri) = eventTicket.tiers(0);
        assertEq(minted, 1);
        assertEq(eventTicket.tokenURI(1), "ipfs://ga");

        // 3. Check Balances (Pull Payment)
        // Price: 100 USDC
        // Fee: 2.5% = 2.5 USDC
        // Organizer: 97.5 USDC
        assertEq(marketplace.balances(treasury), 2500000); // 2.5 USDC
        assertEq(marketplace.balances(organizer), 97500000); // 97.5 USDC

        // 4. Organizer withdraws funds
        vm.startPrank(organizer);
        uint256 balanceBefore = usdc.balanceOf(organizer);
        marketplace.withdraw();
        uint256 balanceAfter = usdc.balanceOf(organizer);
        assertEq(balanceAfter - balanceBefore, 97500000);
        vm.stopPrank();
    }

    function testRefund() public {
        // Setup event
        vm.startPrank(organizer);
        IEventTicket.TicketTier[] memory tiers = createDefaultTiers();
        address eventAddress = factory.deployEvent{value: 0.01 ether}(
            "Test Event", "TEST", 1, block.timestamp + 30 days, tiers
        );
        EventTicket eventTicket = EventTicket(eventAddress);
        
        // Organizer deposits funds to cover refund fees (2.5 USDC shortfall per ticket)
        marketplace.deposit(10 * 10**6); 
        vm.stopPrank();

        // Buyer mints
        vm.startPrank(buyer);
        eventTicket.mint(0, "A1");
        vm.stopPrank();

        // Buyer requests refund
        vm.startPrank(buyer);
        eventTicket.refundTicket(1);
        vm.stopPrank();
        
        // Check ticket burned
        vm.expectRevert();
        eventTicket.ownerOf(1);
        
        // Check funds returned to buyer's internal balance (100 USDC)
        assertEq(marketplace.balances(buyer), 100 * 10**6);
    }

    // --- Fuzz Tests ---

    function testFuzz_DeployEvent(
        string memory name,
        string memory symbol,
        uint256 eventId,
        uint256 eventDateOffset
    ) public {
        // Bound inputs to reasonable values
        eventDateOffset = bound(eventDateOffset, 1 days, 365 days);
        
        // Avoid empty strings for name/symbol if contract requires them (optional check)
        if (bytes(name).length == 0) name = "Event";
        if (bytes(symbol).length == 0) symbol = "EVT";

        vm.startPrank(organizer);
        IEventTicket.TicketTier[] memory tiers = createDefaultTiers();
        
        address eventAddress = factory.deployEvent{value: 0.01 ether}(
            name,
            symbol,
            eventId,
            block.timestamp + eventDateOffset,
            tiers
        );
        
        EventTicket eventTicket = EventTicket(eventAddress);
        assertEq(eventTicket.name(), name);
        assertEq(eventTicket.symbol(), symbol);
        vm.stopPrank();
    }

    function testFuzz_MintTicket(uint8 tierId, uint16 seatNum) public {
        // Setup event
        vm.startPrank(organizer);
        IEventTicket.TicketTier[] memory tiers = createDefaultTiers();
        address eventAddress = factory.deployEvent{value: 0.01 ether}(
            "Fuzz Event", "FUZZ", 1, block.timestamp + 30 days, tiers
        );
        EventTicket eventTicket = EventTicket(eventAddress);
        vm.stopPrank();

        // Bound tierId to valid range [0, 1]
        tierId = uint8(bound(tierId, 0, 1));
        string memory seatNumber = string(abi.encodePacked("Seat-", vm.toString(seatNum)));

        vm.startPrank(buyer);
        eventTicket.mint(tierId, seatNumber);
        vm.stopPrank();

        // Verify
        // Token ID starts at 1
        assertEq(eventTicket.ownerOf(1), buyer);
        // Check mapping
        (,,, uint256 minted,) = eventTicket.tiers(tierId);
        assertEq(minted, 1);
    }

    function testFuzz_MintInsufficientFunds(uint256 paymentAmount) public {
        // Setup event
        vm.startPrank(organizer);
        IEventTicket.TicketTier[] memory tiers = createDefaultTiers();
        address eventAddress = factory.deployEvent{value: 0.01 ether}(
            "Fuzz Event", "FUZZ", 1, block.timestamp + 30 days, tiers
        );
        EventTicket eventTicket = EventTicket(eventAddress);
        vm.stopPrank();

        // Create a poor buyer
        address poorBuyer = address(10);
        vm.startPrank(deployer);
        verification.verifyUser(poorBuyer, UserVerification.VerificationLevel.BASIC, 365 days);
        vm.stopPrank();

        // Bound payment to be less than price (100 USDC)
        paymentAmount = bound(paymentAmount, 0, 99 * 10**6);
        usdc.mint(poorBuyer, paymentAmount);
        
        vm.startPrank(poorBuyer);
        usdc.approve(address(marketplace), type(uint256).max);
        
        vm.expectRevert(); // Should revert due to transfer failure or insufficient funds check
        eventTicket.mint(0, "A1");
        vm.stopPrank();
    }
}
