// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title GovernanceToken
/// @notice ERC-20 governance token with EIP-2612 permit to streamline UX.
/// @dev Owner (the DAO) can mint initial supply or future distributions if desired.
contract GovernanceToken is ERC20, ERC20Permit, Ownable {
    constructor(
        string memory name_,
        string memory symbol_,
        address owner_,
        uint256 initialSupply
    ) ERC20(name_, symbol_) ERC20Permit(name_) Ownable(owner_) {
        if (initialSupply > 0) {
            _mint(owner_, initialSupply);
        }
    }

    /// @notice Mint to an address (optional; can be disabled by not calling)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
