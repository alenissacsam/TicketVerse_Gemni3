// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IEventTicket} from "./interfaces/IEventTicket.sol";

/**
 * @title EventFactory
 * @notice Deploys EventTicket clones using EIP-1167.
 * @dev Implements organizer whitelisting and creation fees.
 */
contract EventFactory is Ownable {
    address public immutable IMPLEMENTATION;
    address public immutable USER_VERIFICATION;
    address public immutable MARKETPLACE;
    
    uint256 public creationFee = 0.01 ether;
    mapping(address => bool) public whitelistedOrganizers;

    event EventDeployed(address indexed eventContract, uint256 eventId, address organizer);
    event OrganizerWhitelisted(address indexed organizer, bool status);
    event CreationFeeUpdated(uint256 newFee);
    event FeesWithdrawn(address indexed recipient, uint256 amount);

    constructor(
        address _implementation,
        address _userVerification,
        address _marketplace
    ) Ownable(msg.sender) {
        IMPLEMENTATION = _implementation;
        USER_VERIFICATION = _userVerification;
        MARKETPLACE = _marketplace;
    }

    /**
     * @notice Whitelist an organizer.
     */
    function setOrganizerStatus(address organizer, bool status) external onlyOwner {
        whitelistedOrganizers[organizer] = status;
        emit OrganizerWhitelisted(organizer, status);
    }

    /**
     * @notice Update the event creation fee.
     */
    function setCreationFee(uint256 _fee) external onlyOwner {
        creationFee = _fee;
        emit CreationFeeUpdated(_fee);
    }

    /**
     * @notice Deploy a new EventTicket clone.
     * @dev Requires ETH payment (creation fee) and whitelisted sender.
     */
    function deployEvent(
        string memory name,
        string memory symbol,
        uint256 eventId,
        uint256 eventDate,
        IEventTicket.TicketTier[] memory tiers
    ) external payable returns (address) {
        require(whitelistedOrganizers[msg.sender], "Not authorized organizer");
        require(msg.value >= creationFee, "Insufficient creation fee");

        address clone = Clones.clone(IMPLEMENTATION);
        
        IEventTicket(clone).initialize(
            name,
            symbol,
            eventId,
            eventDate,
            msg.sender, // Organizer
            USER_VERIFICATION,
            MARKETPLACE,
            tiers
        );

        emit EventDeployed(clone, eventId, msg.sender);
        return clone;
    }

    /**
     * @notice Withdraw collected creation fees.
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");
        
        emit FeesWithdrawn(msg.sender, balance);
    }
}
