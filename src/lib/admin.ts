/**
 * Admin utilities for access control
 */

export const ADMIN_ADDRESS = "0x3706a57b29615f9af745470990e52f420ffd1fb5";

/**
 * Check if a wallet address is an admin
 */
export function isAdmin(address: string | undefined): boolean {
    if (!address) return false;
    return address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
}

/**
 * Format wallet address for display
 */
export function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
