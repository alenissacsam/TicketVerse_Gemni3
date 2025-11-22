// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IUserVerification {
    enum VerificationLevel {
        NONE,
        BASIC,
        PREMIUM,
        VIP
    }

    function verifyUser(address user, VerificationLevel level, uint256 durationSeconds) external;
    function batchVerifyUsers(address[] calldata users, VerificationLevel[] calldata levels, uint256[] calldata durations) external;
    function suspendUser(address user) external;
    function unsuspendUser(address user) external;
    function isVerified(address user) external view returns (bool);
    function hasLevel(address user, VerificationLevel requiredLevel) external view returns (bool);
}
