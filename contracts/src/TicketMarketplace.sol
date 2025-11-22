// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title TicketMarketplace
 * @notice Central financial hub handling payments, secondary trading, and anti-scalping.
 */
contract TicketMarketplace is ReentrancyGuard, Ownable, EIP712 {
    using SafeERC20 for IERC20;

    IERC20 public immutable USDC_TOKEN;
    address public immutable TREASURY;
    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5%
    uint256 public constant MAX_BPS = 10000;

    // EIP-712 TypeHash for Listing
    bytes32 private constant LISTING_TYPEHASH = keccak256(
        "Listing(address seller,address nftContract,uint256 tokenId,uint256 price,uint256 deadline)"
    );

    // Mapping to track user balances (Pull payment pattern)
    mapping(address => uint256) public balances;

    // Mapping to track executed listings to prevent replay
    mapping(bytes32 => bool) public cancelledOrExecuted;

    event FundsDeposited(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed user, uint256 amount);
    event SaleExecuted(
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price,
        uint256 platformFee,
        uint256 royalty
    );
    event RefundProcessed(address indexed buyer, address indexed organizer, uint256 amount);

    constructor(address _usdcToken, address _treasury) 
        Ownable(msg.sender) 
        EIP712("TicketMarketplace", "1") 
    {
        USDC_TOKEN = IERC20(_usdcToken);
        TREASURY = _treasury;
    }

    /**
     * @notice Deposit USDC into the marketplace (e.g. for organizers to fund refunds).
     */
    function deposit(uint256 amount) external nonReentrant {
        USDC_TOKEN.safeTransferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        emit FundsDeposited(msg.sender, amount);
    }

    /**
     * @notice Process a primary sale (Minting).
     */
    function processPrimarySale(
        address buyer,
        address organizer,
        uint256 amount
    ) external nonReentrant {
        // Transfer USDC from buyer to this contract
        USDC_TOKEN.safeTransferFrom(buyer, address(this), amount);

        // Calculate platform fee
        uint256 fee = (amount * PLATFORM_FEE_BPS) / MAX_BPS;
        uint256 organizerAmount = amount - fee;

        // Credit balances (Pull pattern)
        balances[TREASURY] += fee;
        balances[organizer] += organizerAmount;

        emit FundsDeposited(organizer, organizerAmount);
        emit FundsDeposited(TREASURY, fee);
    }

    /**
     * @notice Process a refund (Called by EventTicket).
     * @dev Debits organizer balance and credits buyer.
     */
    function processRefund(
        address buyer,
        address organizer,
        uint256 amount
    ) external nonReentrant {
        // In a real system, we should check if msg.sender is a valid EventTicket contract
        
        require(balances[organizer] >= amount, "Insufficient organizer funds for refund");
        
        balances[organizer] -= amount;
        balances[buyer] += amount; // Credit buyer's internal balance
        
        emit RefundProcessed(buyer, organizer, amount);
    }

    /**
     * @notice Execute a secondary sale via EIP-712 signature (Gasless listing).
     */
    function buyTicket(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 deadline,
        address seller,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant {
        require(block.timestamp <= deadline, "Listing expired");

        // Verify Signature
        bytes32 structHash = keccak256(abi.encode(
            LISTING_TYPEHASH,
            seller,
            nftContract,
            tokenId,
            price,
            deadline
        ));
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, v, r, s);
        
        require(signer == seller, "Invalid signature");
        require(!cancelledOrExecuted[structHash], "Listing already executed or cancelled");

        // Mark as executed
        cancelledOrExecuted[structHash] = true;

        // Transfer USDC from buyer
        USDC_TOKEN.safeTransferFrom(msg.sender, address(this), price);

        // Calculate Fees & Royalties (Anti-scalping logic)
        uint256 platformFee = (price * PLATFORM_FEE_BPS) / MAX_BPS;
        uint256 royalty = (price * 500) / MAX_BPS; // 5% royalty
        uint256 sellerAmount = price - platformFee - royalty;

        // Credit balances
        balances[TREASURY] += platformFee;
        balances[seller] += sellerAmount;
        // balances[organizer] += royalty; // Need organizer lookup

        // Transfer NFT
        (bool success, ) = nftContract.call(
            abi.encodeWithSignature("safeTransferFrom(address,address,uint256)", seller, msg.sender, tokenId)
        );
        require(success, "NFT transfer failed");

        emit SaleExecuted(nftContract, tokenId, seller, msg.sender, price, platformFee, royalty);
    }

    /**
     * @notice Cancel a listing.
     */
    function cancelListing(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 deadline
    ) external {
        bytes32 structHash = keccak256(abi.encode(
            LISTING_TYPEHASH,
            msg.sender,
            nftContract,
            tokenId,
            price,
            deadline
        ));
        cancelledOrExecuted[structHash] = true;
    }

    /**
     * @notice Withdraw available funds.
     */
    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds to withdraw");

        balances[msg.sender] = 0;
        USDC_TOKEN.safeTransfer(msg.sender, amount);

        emit FundsWithdrawn(msg.sender, amount);
    }
}
