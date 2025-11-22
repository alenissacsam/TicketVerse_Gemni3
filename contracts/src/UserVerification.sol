// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UserVerification
 * @notice Implements a centralized KYC and anti-bot layer with tiered access.
 */
contract UserVerification is Ownable {
    enum VerificationLevel {
        NONE,
        BASIC,
        PREMIUM,
        VIP
    }

    struct UserStatus {
        VerificationLevel level;
        uint256 expiry;
        bool isSuspended;
    }

    mapping(address => UserStatus) public userStatus;
    mapping(address => bool) public isVerifier;

    event UserVerified(address indexed user, VerificationLevel level, uint256 expiry);
    event UserSuspended(address indexed user);
    event UserUnsuspended(address indexed user);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    modifier onlyVerifier() {
        _onlyVerifier();
        _;
    }

    function _onlyVerifier() internal view {
        require(isVerifier[msg.sender] || msg.sender == owner(), "Not authorized verifier");
    }

    constructor() Ownable(msg.sender) {
        isVerifier[msg.sender] = true;
    }

    /**
     * @notice Verify a user with a specific level and expiry.
     * @param user Address of the user to verify.
     * @param level Verification level (1=Basic, 2=Premium, 3=VIP).
     * @param durationSeconds Duration of verification validity in seconds.
     */
    function verifyUser(address user, VerificationLevel level, uint256 durationSeconds) external onlyVerifier {
        require(level != VerificationLevel.NONE, "Invalid level");
        
        userStatus[user] = UserStatus({
            level: level,
            expiry: block.timestamp + durationSeconds,
            isSuspended: false
        });

        emit UserVerified(user, level, block.timestamp + durationSeconds);
    }

    /**
     * @notice Batch verify users to save gas.
     */
    function batchVerifyUsers(
        address[] calldata users,
        VerificationLevel[] calldata levels,
        uint256[] calldata durations
    ) external onlyVerifier {
        require(users.length == levels.length && levels.length == durations.length, "Length mismatch");

        for (uint256 i = 0; i < users.length; i++) {
            userStatus[users[i]] = UserStatus({
                level: levels[i],
                expiry: block.timestamp + durations[i],
                isSuspended: false
            });
            emit UserVerified(users[i], levels[i], block.timestamp + durations[i]);
        }
    }

    /**
     * @notice Suspend a user (ban).
     */
    function suspendUser(address user) external onlyVerifier {
        userStatus[user].isSuspended = true;
        emit UserSuspended(user);
    }

    /**
     * @notice Unsuspend a user.
     */
    function unsuspendUser(address user) external onlyVerifier {
        userStatus[user].isSuspended = false;
        emit UserUnsuspended(user);
    }

    /**
     * @notice Add a verified signer (e.g., backend server).
     */
    function addVerifier(address verifier) external onlyOwner {
        isVerifier[verifier] = true;
        emit VerifierAdded(verifier);
    }

    /**
     * @notice Remove a verified signer.
     */
    function removeVerifier(address verifier) external onlyOwner {
        isVerifier[verifier] = false;
        emit VerifierRemoved(verifier);
    }

    /**
     * @notice Check if a user is verified and active.
     */
    function isVerified(address user) external view returns (bool) {
        UserStatus memory status = userStatus[user];
        return !status.isSuspended && 
               status.level != VerificationLevel.NONE && 
               block.timestamp < status.expiry;
    }

    /**
     * @notice Check if a user has at least a specific level.
     */
    function hasLevel(address user, VerificationLevel requiredLevel) external view returns (bool) {
        UserStatus memory status = userStatus[user];
        return !status.isSuspended && 
               status.level >= requiredLevel && 
               block.timestamp < status.expiry;
    }
}
